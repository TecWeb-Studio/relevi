# Image Integration Guide

## How to Switch Employee Emojis to Images

Your website now supports displaying both emojis and professional images for team members. Here's how to customize it:

### Step 1: Add Images to Public Folder
1. Create a new folder in your project: `/public/team-photos/`
2. Add your team member photos (JPG, PNG format)
3. Name them clearly, e.g., `sarah-mitchell.jpg`, `james-chen.jpg`

### Step 2: Update Team Member Data
In `/app/team/page.tsx`, add the `image` property to each team member:

```tsx
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Founder & Lead Therapist',
    bio: '...',
    specialties: [...],
    experience: '15+ years',
    certifications: [...],
    emoji: '👩‍⚕️',
    image: '/team-photos/sarah-mitchell.jpg', // Add this line
  },
  // ... other members
];
```

### Image Requirements
- **Format**: JPG or PNG
- **Size**: Recommended 400x400px or larger
- **Aspect Ratio**: Square (1:1) works best for perfect display
- **File Size**: Keep under 500KB for faster loading

### Example for All Team Members
```tsx
{
  id: 1,
  name: 'Sarah Mitchell',
  role: 'Founder & Lead Therapist',
  image: '/team-photos/sarah-mitchell.jpg',
  // ... other properties
},
{
  id: 2,
  name: 'James Chen',
  role: 'Senior Massage Therapist',
  image: '/team-photos/james-chen.jpg',
  // ... other properties
},
// ... add images for all 6 team members
```

### Services Page Images (Optional)
The services page also supports images! In `/app/services/page.tsx`, you can add images to services:

```tsx
{
  id: 1,
  title: 'Swedish Massage',
  description: '...',
  image: '/service-photos/swedish-massage.jpg', // Optional
  // ... other properties
},
```

## Website Improvements Made

### 1. **Employee Images Support** ✅
- Team members can now display professional photos instead of emojis
- Emojis still work as fallback if no image is provided
- Smooth animations and styling included

### 2. **New Services Page** ✅
- Dedicated page at `/services` with all massage services
- Categorized with "Recommended" filter
- Service packages section (Wellness Starter, Healing Retreat, Premium Rejuvenation)
- Detailed modal view for each service showing benefits and pricing
- Mobile-responsive design

### 3. **Updated Navigation** ✅
- Services now link to `/services` page instead of home section
- Clean navigation structure
- Links added to all pages

### 4. **Homepage Cleanup** ✅
- Removed inline services section
- More focused hero and value proposition
- "Explore Services" button instead of inline services grid
- Cleaner, more professional look

## File Structure
```
app/
├── page.tsx                    (Updated: Removed services section)
├── services/
│   └── page.tsx               (NEW: Complete services page)
├── team/
│   └── page.tsx               (Updated: Image support for team members)
├── components/
│   └── Navigation.tsx          (Updated: Services page link)
└── ...
public/
└── team-photos/               (Create: Store team member images here)
```

## Next Steps
1. Add team member photos to `/public/team-photos/`
2. Update the `image` properties in `/app/team/page.tsx`
3. Optionally add service images to `/app/services/page.tsx`
4. Test the website to see the new features in action!

## Styling Notes
- Images are displayed with a gradient background that shows through if image doesn't load
- Hover effects include scale animation (10% zoom on hover)
- Recommended services show a gold "⭐ Recommended" badge
- Cards have smooth shadows and lift animation on hover

Enjoy your improved website!
