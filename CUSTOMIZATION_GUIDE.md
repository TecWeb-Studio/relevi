# Quick Tips & Customization Guide

## 🎯 Best Practices

### Team Member Photos
- Use professional headshots with consistent lighting
- Recommended background: Neutral or blurred
- Clothing: Professional attire matching your brand
- Expression: Warm, friendly smiles
- Size: 400x400px or larger (square format works best)

### Service Images
- Show therapy in action or peaceful spa settings
- Consistent color grading with your brand (olive/warm tones)
- Quality matters: 600x600px+ recommended
- Professional stock photos work great (Unsplash, Pexels)

---

## 🎨 Customization Ideas

### Update Service Packages
Edit `/app/services/page.tsx` around line 450 to add/modify packages:
```tsx
{
  name: 'Your Package Name',
  services: ['Service 1', 'Service 2', 'Service 3'],
  price: '$XXX',
  description: 'Description here',
  featured: false, // Set to true for one featured package
}
```

### Change Service Prices
In `/app/services/page.tsx`, update the `price` property for each service:
```tsx
{
  id: 1,
  title: 'Swedish Massage',
  description: '...',
  price: '$150', // Change this
  duration: '60-90 minutes',
  // ...
}
```

### Add New Services
In `/app/services/page.tsx`, add to the `services` array:
```tsx
{
  id: 9,
  title: 'Your New Service',
  description: 'Short description',
  fullDescription: 'Detailed description here',
  icon: '✨', // Emoji or remove to use image
  image: '/service-photos/new-service.jpg',
  benefits: ['Benefit 1', 'Benefit 2', 'Benefit 3'],
  duration: '60 minutes',
  price: '$XXX',
  recommended: false,
}
```

---

## 📸 Photo Upload Steps

### 1. Team Member Photos
```bash
# Create folder if it doesn't exist
mkdir public/team-photos

# Add your images here:
# - sarah-mitchell.jpg
# - james-chen.jpg
# - maria-rodriguez.jpg
# - david-thompson.jpg
# - emma-williams.jpg
# - michael-park.jpg
```

### 2. Service Photos (Optional)
```bash
# Create folder if it doesn't exist
mkdir public/service-photos

# Add service images:
# - swedish-massage.jpg
# - deep-tissue.jpg
# - hot-stone-therapy.jpg
# etc.
```

---

## 🔧 Advanced Customization

### Change Colors
The site uses an "olive" color scheme. By default, this is Tailwind's built-in color, but if you want to customize:

1. Open `globals.css`
2. Look for color definitions
3. Adjust hex values as needed

Common color classes used:
- `olive-50` (lightest)
- `olive-100`, `olive-200`, `olive-300`
- `olive-600` (primary button)
- `olive-700`, `olive-800` (dark text)

### Add New Navigation Links
In `/app/components/Navigation.tsx`, update the `navLinks` array:
```tsx
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/team', label: 'Our Team' },
  { href: '/events', label: 'Events' },
  { href: '/new-page', label: 'New Page' }, // Add here
  { href: '/#contact', label: 'Contact' },
];
```

---

## 📱 Mobile Testing

Your improvements are fully responsive! Test on:
- iPhone (375px width)
- iPad (768px width)
- Desktop (1200px+ width)

Key responsive breakpoints:
- `sm:` (640px) - Small screens
- `md:` (768px) - Medium screens
- `lg:` (1024px) - Large screens

---

## ⚡ Performance Tips

### Image Optimization
```tsx
// Use Next.js Image component for auto-optimization (optional upgrade)
import Image from 'next/image';

<Image
  src="/team-photos/sarah.jpg"
  alt="Sarah Mitchell"
  width={400}
  height={400}
/>
```

### Lazy Loading
Images automatically lazy-load on your site - they load when visible!

### File Naming Convention
Use descriptive, lowercase names with hyphens:
- ✅ Good: `sarah-mitchell.jpg`, `deep-tissue-massage.jpg`
- ❌ Avoid: `sarah.JPG`, `Service_1_Image.png`

---

## 🚀 Launch Checklist

Before going live:

- [ ] Add all team member photos
- [ ] Update all team member image paths
- [ ] Review all service descriptions and pricing
- [ ] Test all links work correctly
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Update contact email for bookings
- [ ] Connect to email service (SendGrid, Mailgun, etc.)
- [ ] Set up payment processing if needed
- [ ] Deploy to production

---

## 🐛 Troubleshooting

### Images Not Showing
**Problem**: Image appears as broken icon  
**Solutions**:
1. Check file path spelling and capitalization
2. Ensure file exists in `/public` folder
3. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
4. Check file format (JPG, PNG only)

### Styling looks off
**Problem**: Colors or spacing look wrong  
**Solutions**:
1. Clear browser cache
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Check for CSS file corruption
4. Rebuild project: `npm run build`

### Services page not loading
**Problem**: 404 error accessing /services  
**Solutions**:
1. Ensure `/app/services/page.tsx` exists
2. Restart dev server: `npm run dev`
3. Check for TypeScript errors: `npm run build`

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Need Help?

Refer to the documentation files:
- `IMAGE_INTEGRATION_GUIDE.md` - Image setup
- `IMPROVEMENTS_SUMMARY.md` - Feature overview

Good luck with your Relevi Healing website! 💆‍♀️✨
