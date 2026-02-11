# PDF Lessons Directory

Upload your cultural insights PDF lessons to this directory.

## How to add a new lesson:

1. Upload your PDF file to this directory (e.g., `lesson1.pdf`)
2. Add a reference to the cultural insights page at `app/approfondimenti-culturali/page.tsx`
3. Add translations for the lesson in both `public/locales/en/translation.json` and `public/locales/it/translation.json`

### Example:

In `app/approfondimenti-culturali/page.tsx`, add to the `lessons` array:
```typescript
const lessons: CulturalLesson[] = [
  { 
    id: 1, 
    key: 'lesson1', 
    pdfUrl: '/pdfs/lesson1.pdf', 
    category: 'philosophy' 
  },
  // Add more lessons here...
];
```

In translation files, add under `"culturalInsights.lessons"`:
```json
"lesson1": {
  "title": "Lesson Title Here",
  "description": "Brief description of the lesson content..."
}
```
