# Media Folder Setup Guide

All components have been updated to fetch images from your local `media/` folder instead of using hardcoded stock images.

## Required Folder Structure

```
media/
├── heroes/
│   ├── home/          ✅ (3 images) - Homepage hero slider
│   ├── gallery/       ✅ (2 images) - Gallery page hero
│   └── about/         ✅ (3 images) - About page hero
├── gallery/
│   ├── portraits/     ✅ (13 images) - Gallery portraits grid
│   └── wides/         ✅ (9 images) - Gallery wides grid
├── about/
│   └── approach/      ✅ (4 images) - About page approach mosaic
├── contact/
│   └── backgrounds/   ✅ (2 images) - Contact page background
└── home/
    ├── intro/         ⚠️ NEEDS 4 IMAGES - AboutIntroSection (2x2 grid)
    ├── video/         ⚠️ NEEDS 1 VIDEO + 1 POSTER IMAGE - FullWidthVideo section
    ├── about_teaser/  ⚠️ NEEDS 6 IMAGES - AboutTeaser scrolling panels (2 per panel, 3 panels)
    ├── parallax/      ⚠️ NEEDS 1 IMAGE - ParallaxSection background
    └── portfolio_slideshow/
        ├── portraits/     ⚠️ NEEDS 6 PORTRAIT IMAGES - For triptych layouts
        └── landscapes/    ⚠️ NEEDS 2 LANDSCAPE IMAGES - For hero slides
```

## What You Need to Add

### 1. **home/intro/** - 4 images
   - Used in: `AboutIntroSection` component on homepage
   - Layout: 2 columns, 2 images each
   - Aspect ratios: portrait (3:4) and landscape (4:3) mixed
   - **Suggested images**: Wedding portraits, couple moments, ceremony shots

### 2. **home/video/** - 1 video file + 1 poster image (optional)
   - Used in: `FullWidthVideo` component on homepage
   - Video format: `.mp4`, `.webm`, or `.mov`
   - Poster: Any image for video thumbnail
   - **Suggested content**: Cinematic wedding video, couple walking, venue shots

### 3. **home/about_teaser/** - 6 images
   - Used in: `AboutTeaser` scrolling component on homepage
   - Layout: 3 panels, 2 images per panel
   - Images will be displayed in overlapping style
   - **Suggested images**: Behind-the-scenes, candid moments, storytelling shots

### 4. **home/parallax/** - 1 image
   - Used in: `ParallaxSection` component on homepage
   - Should be a wide, landscape image
   - Will have parallax scroll effect
   - **Suggested image**: Dramatic landscape, celebration scene, wide venue shot

### 5. **home/portfolio_slideshow/portraits/** - 6 portrait images
   - Used in: `PortfolioSlideshow` component on homepage (triptych layouts)
   - Orientation: **Portrait/vertical** images only
   - Layout: Two triptych slides with 3 portraits each
   - **Suggested images**: Vertical wedding portraits, couple shots, close-ups

### 6. **home/portfolio_slideshow/landscapes/** - 2 landscape images
   - Used in: `PortfolioSlideshow` component on homepage (hero slides)
   - Orientation: **Landscape/horizontal** images only
   - Layout: Two full-width hero slides
   - **Suggested images**: Wide venue shots, landscape ceremony photos, panoramic scenes

## How to Add Images

1. **Copy your images** into the respective folders
2. **Supported formats**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
3. **Video formats**: `.mp4`, `.webm`, `.mov`
4. **File names**: Any name works (spaces and special characters are supported)
5. **No restart needed**: The frontend will automatically fetch new images on page refresh

## Current Status

✅ **Working (already have images)**:
- Homepage hero slider
- Gallery page (portraits, wides, hero)
- About page (hero, approach grid)
- Contact page background

⚠️ **Need images (sections won't show until you add them)**:
- Homepage intro section
- Homepage video section
- Homepage about teaser
- Homepage parallax section
- Homepage portfolio slideshow

## Quick Test

After adding images, refresh your browser (Ctrl+R) and check:
- Homepage should show all sections with your images
- No more blank spaces or missing sections
- All images should load from `http://localhost:5000/media/...`

## Notes

- **Minimum requirements**: Each folder needs the specified number of images
- **If fewer images**: That section won't render (intentional, to avoid broken layouts)
- **Order matters**: Images are used in alphabetical order by filename
- **Rename for control**: Use numbered prefixes (e.g., `01-image.jpg`, `02-image.jpg`) to control order
