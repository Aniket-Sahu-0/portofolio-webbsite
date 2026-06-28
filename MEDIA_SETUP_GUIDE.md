# Media Setup Guide

All images are stored and served from **Cloudinary**. There is no local `media/` folder in production.

## Cloudinary Folder Structure

Images must be uploaded to Cloudinary under these exact folder paths:

| Cloudinary Folder | Feeds | Notes |
|---|---|---|
| `media/heroes/home/` | Homepage hero slideshow | First 5 used |
| `media/home/about_teaser/` | Homepage intro scroll scene | First 6 (2 per panel) |
| `media/home/portfolio_slideshow/portraits/` | Homepage gallery marquee | First 20 |
| `media/home/parallax/` | Homepage parallax section | First 1 |
| `media/home/approach/` | Services · Approach panel | First 1 |
| `media/home/notes/` | Services · Notes card backgrounds | First 2 |
| `media/home/bookings/` | Services · Bookings panel | First 1 |
| `media/about/portrait/` | About page flip-card portrait | First 1 |
| `media/about/testimonials/` | About testimonial cards | First 4 |
| `media/gallery/portraits/` | Gallery page portrait grid | Up to 500 |
| `media/gallery/wides/` | Gallery page wide row | Up to 500 |
| `media/heroes/gallery/` | Gallery page hero | First 1 |
| `media/contact/backgrounds/` | Contact page background | First 1 |

## How to Add / Replace Images

1. Log in to [Cloudinary](https://cloudinary.com)
2. Go to **Media Library**
3. Navigate to the folder (e.g. `media/heroes/home`)
4. Upload your images directly into that folder
5. Refresh the site — images update on the next page load (5-minute cache)

## Image Order

Images are served sorted alphabetically by filename. To control order, prefix filenames with numbers:
```
01-ceremony.jpg
02-couple.jpg
03-reception.jpg
```

## Supported Formats

`.jpg`, `.jpeg`, `.png`, `.webp` — Cloudinary handles conversion and compression automatically.

## Environment Variables Required

The server needs these set (in Railway dashboard for production, `server/.env` for local dev):

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
