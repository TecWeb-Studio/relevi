# PDF Lessons Directory

Upload your cultural insights PDF lessons to this directory. The system will automatically detect and display all PDFs in this folder.

## How to add a new lesson:

1. **Upload your PDF file** to this directory (e.g., `philosophy-introduction.pdf`, `wellness-guide.pdf`)
2. **Add translations** for the lesson title and description in both:
   - `public/locales/en/translation.json`
   - `public/locales/it/translation.json`
3. The page will automatically detect the PDF and display it

## Translation Setup

After uploading a PDF, add translations for its title and description using the PDF filename (without .pdf extension) converted to camelCase as the key.

### Example:

If you upload `philosophy-introduction.pdf`:

1. In `public/locales/en/translation.json`, add under `"culturalInsights.lessons"`:

```json
"philosophyIntroduction": {
  "title": "Introduction to Philosophy",
  "description": "A comprehensive guide to the fundamentals of philosophy and ancient wisdom."
}
```

2. In `public/locales/it/translation.json`, add the same key with Italian translations:

```json
"philosophyIntroduction": {
  "title": "Introduzione alla Filosofia",
  "description": "Una guida completa ai fondamenti della filosofia e della saggezza antica."
}
```

## Filename to Key Conversion

The system automatically converts filenames to translation keys:

- `philosophy-introduction.pdf` → `philosophyIntroduction`
- `wellness-guide-2024.pdf` → `wellnessGuide2024`
- `history_of_healing.pdf` → `historyOfHealing`
- Spaces, underscores, and hyphens are removed/converted
- The first letter is lowercase, subsequent word starts are capitalized (camelCase)

## Default Category Assignment

Currently, all PDFs are assigned to the `philosophy` category by default. To customize categories for different PDFs, you'll need to:

1. Update the `lib/pdfConfig.ts` file with a mapping of filenames to categories
2. Example:

```typescript
export const pdfCategoryMap: Record<string, string> = {
  "wellness-meditation.pdf": "wellness",
  "history-ancient-healing.pdf": "history",
  "spirituality-guide.pdf": "spirituality",
};
```

## File Organization Tips

- Use descriptive filenames with hyphens: `philosophy-stoicism.pdf`, `wellness-meditation.pdf`
- This makes translation keys clear and organized
- Keep PDFs under 50MB for optimal performance
- Place all PDFs directly in this directory (no subdirectories)

## Available Categories

- `philosophy` - Philosophical teachings
- `history` - Historical content
- `wellness` - Wellness and health
- `spirituality` - Spiritual practices

All PDFs default to `philosophy` category unless overridden in `lib/pdfConfig.ts`.
