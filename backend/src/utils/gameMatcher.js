/**
 * Game Matcher Utility
 * Accurately matches RAWG games with CheapShark games using strict title normalization,
 * Roman/Arabic numeral consistency, and similarity scoring to avoid showing incorrect or unrelated deals.
 */

// Common edition/pack suffixes that should be normalized for base game comparison
const EDITION_REGEX = /\b(standard|deluxe|goty|game of the year|ultimate|definitive|remastered|enhanced|collector'?s|special|complete|anniversary|director'?s cut|gold|edition|bundle|pack|pass)\b/gi;

// Keywords that indicate non-game items (DLCs, soundtracks, expansion passes, guides, tools)
const EXCLUDED_KEYWORDS = [
  'soundtrack',
  'ost',
  'artbook',
  'dlc',
  'season pass',
  'expansion pass',
  'interactive map',
  'wallpaper',
  'sfx',
  'strategy guide',
  'trailer',
  'tool',
  'tools',
  'editor',
  'server',
  'dedicated server',
  'mod',
  'mods',
  'costume pack',
  'skin pack',
  'cheat',
  'trainer',
  'benchmark',
  'vr benchmark',
  'demo',
  'guide',
  'manual',
  'goodies collection',
  'redkit',
  'audio',
  'sample pack',
];

/**
 * Clean and normalize a game title for comparison
 * @param {string} str
 * @returns {string}
 */
export const normalizeTitle = (str = '') => {
  return str
    .toLowerCase()
    .replace(/['’"]/g, '') // Remove quotes/apostrophes (e.g. Tom Clancy's -> Tom Clancys)
    .replace(/[&]/g, 'and') // Standardize ampersand
    .replace(/[\:–—\-_,!?#()[\]{}]/g, ' ') // Replace punctuation with space
    .replace(/\bthe\b/gi, '') // Remove leading/isolated 'the'
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
};

/**
 * Strip edition suffixes to find base game title
 * @param {string} str
 * @returns {string}
 */
export const stripEdition = (str = '') => {
  return normalizeTitle(str)
    .replace(EDITION_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Check if a title itself is an excluded non-game item (soundtrack, tool, mod, etc.)
 */
export const isExcludedNonGame = (title = '') => {
  const norm = normalizeTitle(title);
  for (const kw of EXCLUDED_KEYWORDS) {
    if (norm.includes(kw)) {
      return true;
    }
  }
  return false;
};

/**
 * Check if candidate title contains explicit non-game keywords that the target title lacks
 */
const hasUnmatchedExcludedKeyword = (targetNorm, candidateNorm) => {
  for (const kw of EXCLUDED_KEYWORDS) {
    if (candidateNorm.includes(kw) && !targetNorm.includes(kw)) {
      return true;
    }
  }
  return false;
};

// Common gaming acronyms to full canonical titles
export const COMMON_ACRONYMS = {
  gta: 'grand theft auto',
  rdr: 'red dead redemption',
  cod: 'call of duty',
  gow: 'god of war',
  ac: 'assassins creed',
  re: 'resident evil',
  bf: 'battlefield',
  ff: 'final fantasy',
  tes: 'the elder scrolls',
  cp: 'cyberpunk',
};

/**
 * Expand gaming acronyms into full canonical titles
 * e.g. "rdr2" -> "red dead redemption 2", "gta5" -> "grand theft auto 5", "gta v" -> "grand theft auto v"
 */
export const expandQueryAcronyms = (str = '') => {
  if (!str) return '';
  let clean = str.toLowerCase().trim();
  // Separate letters and digits attached together (e.g. "rdr2" -> "rdr 2", "gta5" -> "gta 5")
  clean = clean.replace(/([a-z]+)(\d+)/g, '$1 $2').replace(/(\d+)([a-z]+)/g, '$1 $2');
  const words = clean.split(/\s+/);
  if (words.length > 0 && COMMON_ACRONYMS[words[0]]) {
    words[0] = COMMON_ACRONYMS[words[0]];
    return words.join(' ');
  }
  return clean;
};

/**
 * Extract key identifying numbers or Roman numerals (e.g. 2077, 3, 5, V, IV, etc.)
 */
export const extractNumerals = (str = '') => {
  let norm = normalizeTitle(str);
  // Split attached letters and numbers (e.g. "gta5" -> "gta 5", "rdr2" -> "rdr 2")
  norm = norm.replace(/([a-z]+)(\d+)/g, '$1 $2').replace(/(\d+)([a-z]+)/g, '$1 $2');
  const words = norm.split(' ');
  const numerals = new Set();

  for (const w of words) {
    // Digits
    if (/^\d+$/.test(w)) {
      numerals.add(w);
      // Map common digits to Roman for cross-matching
      if (w === '1') numerals.add('i');
      if (w === '2') numerals.add('ii');
      if (w === '3') numerals.add('iii');
      if (w === '4') numerals.add('iv');
      if (w === '5') numerals.add('v');
      if (w === '6') numerals.add('vi');
    }
    // Roman numerals (standalone word)
    else if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(w)) {
      numerals.add(w.toLowerCase());
      if (w.toLowerCase() === 'i') numerals.add('1');
      if (w.toLowerCase() === 'ii') numerals.add('2');
      if (w.toLowerCase() === 'iii') numerals.add('3');
      if (w.toLowerCase() === 'iv') numerals.add('4');
      if (w.toLowerCase() === 'v') numerals.add('5');
      if (w.toLowerCase() === 'vi') numerals.add('6');
    }
  }

  return numerals;
};

/**
 * Check if candidate numerals conflict with target numerals
 */
const hasConflictingNumerals = (targetNorm, candNorm) => {
  const targetNums = extractNumerals(targetNorm);
  const candNums = extractNumerals(candNorm);

  // If target has identifying numerals (e.g. 2077, 3, V), candidate must share at least one
  if (targetNums.size > 0) {
    let hasShared = false;
    for (const num of targetNums) {
      if (candNums.has(num)) {
        hasShared = true;
        break;
      }
    }
    // Target has numbers but candidate does not share any
    if (!hasShared) return true;
  }

  // If candidate has numerals, but target does not
  if (candNums.size > 0 && targetNums.size === 0) {
    // E.g. Target is "Cyberpunk" but candidate is "Cyberpunk 2077" or "Cyberpunk 2"
    // That's acceptable if candidate is the main game (Cyberpunk 2077)
    return false;
  }

  return false;
};

/**
 * Check whether a RAWG game title is relevant to the user's search query
 * (handles gaming acronyms like GTA -> Grand Theft Auto, RDR -> Red Dead Redemption,
 * numeral consistency, and strict prefix/phrase matching)
 */
export const isTitleRelevantToQuery = (gameTitle = '', query = '') => {
  if (!gameTitle || !query) return false;

  const normTitle = normalizeTitle(gameTitle);
  const normQuery = normalizeTitle(query);
  const expandedQuery = normalizeTitle(expandQueryAcronyms(query));

  // Exact normalized match (raw or expanded)
  if (normTitle === normQuery || normTitle === expandedQuery) return true;

  // Numeral Conflict Check:
  // If the query (or expanded query) contains numerals (e.g. 2077, 3, 5, V, 2),
  // the title MUST share at least one identifying numeral.
  const queryNums = extractNumerals(expandedQuery.length >= normQuery.length ? expandedQuery : normQuery);
  const titleNums = extractNumerals(normTitle);
  if (queryNums.size > 0) {
    let sharesNumeral = false;
    for (const num of queryNums) {
      if (titleNums.has(num)) {
        sharesNumeral = true;
        break;
      }
    }
    if (!sharesNumeral) return false;
  }

  // Exact prefix match: title starts with raw query or expanded query
  // e.g. "Grand Theft Auto V" starts with "grand theft auto"
  // "Cyberpunk 2077" starts with "cyberpunk"
  // "Knight Squad" starts with "knight"
  if (normTitle.startsWith(normQuery) || (expandedQuery && normTitle.startsWith(expandedQuery))) {
    return true;
  }

  // Title contains the full query or expanded query as a phrase
  if (normTitle.includes(normQuery) || (expandedQuery && normTitle.includes(expandedQuery))) {
    return true;
  }

  // All significant words from the query (length > 2) must be present in the title
  const qWords = (expandedQuery || normQuery)
    .split(' ')
    .filter((w) => w.length > 2 && w !== 'and' && w !== 'the');
  if (qWords.length > 0 && qWords.every((w) => normTitle.includes(w))) {
    return true;
  }

  return false;
};

/**
 * Calculate Jaccard word-token similarity between two normalized strings
 * @param {string} s1
 * @param {string} s2
 * @returns {number} Score between 0 and 1
 */
export const calculateTokenSimilarity = (s1, s2) => {
  const words1 = new Set(s1.split(' ').filter(Boolean));
  const words2 = new Set(s2.split(' ').filter(Boolean));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
};

/**
 * Finds the best verified CheapShark match for a target RAWG game title.
 * Returns null if no candidate passes strict confidence threshold.
 *
 * @param {string} targetTitle - RAWG game title
 * @param {Array} candidates - CheapShark search results from /games?title=
 * @param {number} minConfidence - Minimum threshold (default 0.70)
 * @returns {Object|null}
 */
export const findBestCheapSharkMatch = (targetTitle, candidates = [], minConfidence = 0.70) => {
  if (!targetTitle || !Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  // If target itself is a tool, mod, or soundtrack, reject early
  if (isExcludedNonGame(targetTitle)) {
    return null;
  }

  const targetNorm = normalizeTitle(targetTitle);
  const targetBase = stripEdition(targetTitle);

  let bestMatch = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const candidateTitle = candidate.external || candidate.title || '';
    const candNorm = normalizeTitle(candidateTitle);
    const candBase = stripEdition(candidateTitle);

    // Rule 1: Reject candidate if it has DLC/soundtrack/tool keywords that target does not
    if (hasUnmatchedExcludedKeyword(targetNorm, candNorm)) {
      continue;
    }

    // Rule 2: Reject candidate if identifying numbers conflict (e.g. GTA IV vs GTA V, Witcher 2 vs Witcher 3)
    if (hasConflictingNumerals(targetNorm, candNorm)) {
      continue;
    }

    // Rule 3: Perfect exact normalized match (Highest Priority)
    if (targetNorm === candNorm) {
      return {
        ...candidate,
        matchConfidence: 1.0,
        matchType: 'exact',
      };
    }

    // Rule 4: Exact base title match (e.g. "Game Remastered" vs "Game")
    if (targetBase === candBase && targetBase.length > 2) {
      const score = 0.95;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...candidate, matchConfidence: score, matchType: 'base_exact' };
      }
      continue;
    }

    // Rule 5: Token similarity
    const tokenSim = calculateTokenSimilarity(targetNorm, candNorm);
    const baseSim = calculateTokenSimilarity(targetBase, candBase);
    const combinedScore = Math.max(tokenSim, baseSim);

    if (combinedScore >= minConfidence) {
      // Penalty if lengths diverge drastically
      const lenRatio = Math.min(targetNorm.length, candNorm.length) / Math.max(targetNorm.length, candNorm.length);
      const finalScore = combinedScore * (0.6 + 0.4 * lenRatio);

      if (finalScore > bestScore && finalScore >= minConfidence) {
        bestScore = finalScore;
        bestMatch = { ...candidate, matchConfidence: finalScore, matchType: 'token_similarity' };
      }
    }
  }

  return bestMatch;
};
