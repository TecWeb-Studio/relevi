/**
 * PDF Configuration
 *
 * Map PDF filenames to their categories.
 * If a PDF is not listed here, it defaults to 'philosophy'.
 *
 * Usage: Add entries like:
 * 'wellness-guide.pdf': 'wellness',
 * 'history-of-healing.pdf': 'history',
 */

export const pdfCategoryMap: Record<string, string> = {
  // Example entries - uncomment and modify as needed:
  // 'philosophy-stoicism.pdf': 'philosophy',
  // 'wellness-meditation.pdf': 'wellness',
  // 'history-ancient-healing.pdf': 'history',
  // 'spirituality-guide.pdf': 'spirituality',
};

/**
 * Get the category for a PDF file
 * @param filename - The PDF filename
 * @returns The category, or 'philosophy' as default
 */
export function getPDFCategory(filename: string): string {
  return pdfCategoryMap[filename] || "philosophy";
}
