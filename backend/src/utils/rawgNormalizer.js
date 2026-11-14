/**
 * Normalizer & Parser for RAWG Video Games Database API
 * Converts RAWG API responses into PlayWise consistent game models.
 */

// Helper to parse system requirements string from RAWG
export const parseSystemRequirements = (reqString, type = 'minimum') => {
  const isRec = type === 'recommended';

  // Default fallback requirements if RAWG has missing or unformatted strings
  const fallback = isRec
    ? {
        cpu: 'Intel Core i7-10700K or AMD Ryzen 7 3700X',
        gpu: 'NVIDIA GeForce RTX 3060 12GB or AMD Radeon RX 6700 XT',
        ram: 16,
        vram: 8,
        storage: '80 GB SSD',
        os: 'Windows 11 / 10 64-bit',
      }
    : {
        cpu: 'Intel Core i5-8400 or AMD Ryzen 5 2600',
        gpu: 'NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580',
        ram: 8,
        vram: 4,
        storage: '80 GB Space',
        os: 'Windows 10 64-bit',
      };

  if (!reqString || typeof reqString !== 'string') {
    return fallback;
  }

  const clean = reqString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);

  let cpu = '';
  let gpu = '';
  let ram = 0;
  let storage = '';
  let os = '';
  let vram = 0;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('cpu:') || lower.startsWith('processor:') || lower.includes('processor')) {
      cpu = line.replace(/^(cpu|processor):\s*/i, '').trim();
    } else if (lower.startsWith('gpu:') || lower.startsWith('graphics:') || lower.startsWith('video card:') || lower.includes('graphics:')) {
      gpu = line.replace(/^(gpu|graphics|video card):\s*/i, '').trim();
    } else if (lower.startsWith('ram:') || lower.startsWith('memory:') || lower.includes('memory:')) {
      const gbMatch = line.match(/(\d+)\s*gb/i);
      const mbMatch = line.match(/(\d+)\s*mb/i);
      if (gbMatch) {
        ram = parseInt(gbMatch[1], 10);
      } else if (mbMatch) {
        ram = Math.round(parseInt(mbMatch[1], 10) / 1024);
      }
    } else if (lower.includes('storage') || lower.includes('hard drive') || lower.includes('disk space')) {
      storage = line.replace(/^(storage|hard drive|disk space|available space):\s*/i, '').trim();
    } else if (lower.startsWith('os:') || lower.startsWith('operating system:')) {
      os = line.replace(/^(os|operating system):\s*/i, '').trim();
    } else if (lower.includes('vram')) {
      const gbMatch = line.match(/(\d+)\s*gb/i);
      const mbMatch = line.match(/(\d+)\s*mb/i);
      if (gbMatch) {
        vram = parseInt(gbMatch[1], 10);
      } else if (mbMatch) {
        vram = Math.round(parseInt(mbMatch[1], 10) / 1024);
      }
    }
  }

  // If extraction was incomplete, merge with fallback
  return {
    cpu: cpu || fallback.cpu,
    gpu: gpu || fallback.gpu,
    ram: ram || (isRec ? 16 : 8),
    vram: vram || (isRec ? 8 : 4),
    storage: storage || fallback.storage,
    os: os || fallback.os,
  };
};

// Generates estimated retail prices & mock store deals based on game age and rating
export const generateStoreDeals = (game) => {
  const releaseYear = game.released ? new Date(game.released).getFullYear() : 2023;
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - releaseYear);

  let basePrice = 59.99;
  if (age === 0) basePrice = 69.99;
  else if (age === 1) basePrice = 59.99;
  else if (age === 2) basePrice = 49.99;
  else if (age >= 5) basePrice = 29.99;

  let discount = 0;
  if (age >= 1) {
    const rawgRating = game.rating || 4.0;
    discount = Math.min(75, Math.floor((age * 12) + (rawgRating > 4.2 ? 10 : 25)));
  }

  const salePrice = Number((basePrice * (1 - discount / 100)).toFixed(2));

  // Build store options
  const deals = [
    {
      store: 'Steam',
      price: salePrice,
      regularPrice: basePrice,
      discount,
      url: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name || '')}`,
      inStock: true,
      bestDeal: true,
    },
    {
      store: 'Epic Games',
      price: Number((salePrice * 1.05).toFixed(2)),
      regularPrice: basePrice,
      discount: Math.max(0, discount - 5),
      url: `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(game.name || '')}`,
      inStock: true,
      bestDeal: false,
    },
    {
      store: 'GOG.com',
      price: salePrice,
      regularPrice: basePrice,
      discount,
      url: `https://www.gog.com/en/games?query=${encodeURIComponent(game.name || '')}`,
      inStock: true,
      bestDeal: false,
    },
  ];

  return { basePrice, discount, salePrice, deals };
};

// Normalizes a RAWG game object for consistent frontend consumption
export const normalizeGame = (rawGame, screenshots = []) => {
  if (!rawGame) return null;

  // Extract PC platform specifications
  const pcPlatform = rawGame.platforms?.find(
    (p) =>
      p.platform?.slug === 'pc' ||
      p.platform?.name?.toLowerCase() === 'pc' ||
      p.platform?.id === 4
  );

  const rawReqs = pcPlatform?.requirements || {};
  const minimumRequirements = parseSystemRequirements(rawReqs.minimum, 'minimum');
  const recommendedRequirements = parseSystemRequirements(rawReqs.recommended, 'recommended');

  const { basePrice, discount, salePrice, deals } = generateStoreDeals(rawGame);

  // Genres
  const genres = rawGame.genres?.map((g) => g.name) || ['Action'];

  // Developers & Publishers
  const developer = rawGame.developers?.[0]?.name || rawGame.developer || 'Featured Studio';
  const publisher = rawGame.publishers?.[0]?.name || rawGame.publisher || developer;

  // Tags
  const tags = rawGame.tags?.slice(0, 6).map((t) => t.name) || ['PC Gaming', 'Singleplayer'];

  // Cover and Banner
  const coverImage =
    rawGame.background_image ||
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
  const bannerImage =
    rawGame.background_image_additional ||
    rawGame.background_image ||
    coverImage;

  // Screenshots array
  const screenshotUrls = screenshots.length > 0
    ? screenshots.map((s) => (typeof s === 'string' ? s : s.image))
    : rawGame.short_screenshots?.map((s) => s.image) || [coverImage, bannerImage];

  // Rating out of 10
  const normalizedRating = rawGame.rating
    ? Number((rawGame.rating * 2).toFixed(1))
    : rawGame.metacritic
    ? Number((rawGame.metacritic / 10).toFixed(1))
    : 8.5;

  // Clean description string
  let description =
    rawGame.description_raw ||
    rawGame.description?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ||
    `${rawGame.name} is an acclaimed PC gaming title featured on PlayWise with detailed system benchmark requirements and cross-store pricing.`;

  // First sentence as tagline
  const firstPeriod = description.indexOf('.');
  const tagline =
    firstPeriod > 10 && firstPeriod < 140
      ? description.substring(0, firstPeriod + 1).trim()
      : `Experience ${rawGame.name} on PC with full compatibility benchmarking.`;

  return {
    id: rawGame.slug || String(rawGame.id),
    rawgId: rawGame.id,
    title: rawGame.name,
    slug: rawGame.slug,
    tagline,
    description,
    genres,
    rating: normalizedRating,
    rawgRating: rawGame.rating || 4.2,
    metacritic: rawGame.metacritic || null,
    releaseDate: rawGame.released || '2023-01-01',
    developer,
    publisher,
    coverImage,
    bannerImage,
    screenshots: screenshotUrls,
    price: basePrice,
    discount,
    salePrice,
    tags,
    minimumRequirements,
    recommendedRequirements,
    storeDeals: deals,
    playtime: rawGame.playtime || null,
    esrbRating: rawGame.esrb_rating?.name || 'Everyone',
  };
};

