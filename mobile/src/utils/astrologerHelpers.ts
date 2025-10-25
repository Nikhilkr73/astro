/**
 * Helper functions for astrologer data
 */

/**
 * Safely gets languages array from astrologer data
 * @param languages - The languages field from astrologer (can be null, undefined, or array)
 * @returns Array of languages, defaults to ['Hindi'] if null/undefined
 */
export const getAstrologerLanguages = (languages?: string[] | null): string[] => {
  if (languages && Array.isArray(languages) && languages.length > 0) {
    return languages;
  }
  return ['Hindi'];
};

/**
 * Safely joins languages array into a string
 * @param languages - The languages field from astrologer (can be null, undefined, or array)
 * @param separator - Separator to use when joining (default: ', ')
 * @returns Joined string of languages, defaults to 'Hindi' if null/undefined
 */
export const joinAstrologerLanguages = (languages?: string[] | null, separator: string = ', '): string => {
  return getAstrologerLanguages(languages).join(separator);
};
