# The Wedding Shade - Photographer Portfolio Website

A minimalist, dark-themed documentary photographer portfolio website built with React, TypeScript, Tailwind CSS, and Node.js. Features scroll-driven animations, auto-playing slideshows, and a cohesive grayscale aesthetic.

## 🎯 Project Overview

**The Wedding Shade** is a professional portfolio website designed for documentary photographers who value clean, understated presentation. The site emphasizes visual storytelling through:

- **Minimalist Design**: Dark grayscale palette with subtle accents
- **Scroll-Driven Interactions**: Smooth parallax effects and scroll-triggered animations
- **Auto-Playing Slideshows**: Timed image transitions with themed backgrounds
- **Responsive Layout**: Mobile-first design that scales beautifully
- **Performance Optimized**: Fast loading with lazy-loaded images

## ✨ Key Features

- 🎬 **Hero Slider**: Auto-playing full-screen slideshow with parallax effects
- 🖼️ **Portfolio Slideshow**: Image-driven background tints with framed presentation
- 📜 **Scroll Panels**: Multi-panel about section with blurred backgrounds
- 🎨 **Monochrome Styling**: Consistent grayscale filter across all images
- 📧 **Contact Integration**: Secure form with email notifications
- ⚡ **Optimized Performance**: Lazy loading, efficient animations
- 🔒 **Security**: Rate limiting, input validation, CORS protection
- 📱 **Mobile Responsive**: Touch-friendly interactions and layouts

## 🛠️ Tech Stack & Architecture

### Frontend (Client)
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** with custom design tokens
- **Framer Motion** for scroll-driven animations and transitions
- **React Router** for client-side navigation
- **React Intersection Observer** for viewport-based triggers
- **Canvas API** for image color sampling (background tints)

### Backend (Server)
- **Node.js** with Express framework
- **Nodemailer** for contact form email delivery
- **Winston** for structured logging
- **Express Validator** for input sanitization
- **Helmet** for security headers
- **CORS** for cross-origin resource sharing
- **Express Rate Limit** for API protection

## 🎨 Design System

### Color Palette
```css
/* Tailwind Custom Colors (tailwind.config.js) */
primary: '#0f172a'    /* slate-900 - main text */
secondary: '#64748b'  /* slate-500 - secondary text */
accent: '#cbd5e1'     /* slate-300 - neutral highlights */
rich: '#0b0f19'       /* charcoal - section backgrounds */
```

### Typography
- **Headings**: Playfair Display (serif) - elegant, editorial feel
- **Body**: Inter (sans-serif) - clean, readable
- **Tracking**: Wide letter-spacing on small caps labels

### Animation System
Centralized timing in `client/src/config/animation.ts`:
```typescript
SLIDE_DURATION_MS = 5000    // 5s per slide
TRANSITION_DURATION_S = 0.8 // 0.8s crossfade
EASE_CURVE = [0.22, 1, 0.36, 1] // Custom easing
```

## 📁 Component Architecture

### Core Components

#### `HeroSlider.tsx`
- Full-screen auto-playing slideshow
- Supports image, video, and parallax slides
- Minimal overlay text (no CTA buttons)
- Dot navigation at bottom

#### `PortfolioSlideshow.tsx`
- Non-interactive auto-advancing gallery
- Image-driven background tints via canvas sampling
- Triptych (3-image) and hero (single) layouts
- Framed presentation with shadows and rings

#### `AboutTeaser.tsx`
- Scroll-driven multi-panel section
- Blurred background from panel images
- Dual-image overlapping layout
- Height: 300vh for smooth scroll progression

#### `ParallaxSection.tsx`
- Full-screen parallax background image
- Centered headline and CTA
- Height: 90vh on mobile, 100vh on desktop

#### `AboutIntroSection.tsx`
- Two-column layout (text + dual images)
- Consistent dark background (`bg-rich`)
- Staggered image positioning

### Utility Classes
```css
/* Custom utilities in index.css */
.mono { filter: grayscale(100%) contrast(105%); }
.no-scrollbar { /* cross-browser scrollbar hiding */ }
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.x or higher
- **npm** 8.x or higher  
- **Git** for version control

### Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd photographer-portfolio
   
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

2. **Configure Environment**
   ```bash
   # In server directory
   cp .env.example .env
   # Edit .env with your SMTP settings (see Configuration section)
   ```

3. **Start Development Servers**
   
   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev  # Starts on http://localhost:5000
   ```
   
   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev  # Starts on http://localhost:3000
   ```

4. **Access the Site**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Health Check**: http://localhost:5000/api/health

## ⚙️ Configuration

### Environment Variables

#### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend (`server/.env`)
```env
# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ENABLED=true
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100

# Email (Contact Form)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-test-email@ethereal.email
SMTP_PASS=your-test-password
EMAIL_FROM=noreply@theweddingshade.com
EMAIL_TO=your-email@example.com

# Security
HELMET_ENABLED=true
MORGAN_FORMAT=dev
```

### Development Email Testing
Use [Ethereal Email](https://ethereal.email/) for testing:
1. Create a test account at ethereal.email
2. Use the generated SMTP credentials in your `.env`
3. Check sent emails in the Ethereal web interface

## Project Structure

```
photographer-portfolio/
├── client/                  # Frontend React application
│   ├── public/              # Static files
│   └── src/                 # Source files
│       ├── components/      # Reusable components
│       ├── pages/           # Page components
│       ├── App.tsx          # Main App component
│       └── main.tsx         # Entry point
│
├── server/                  # Backend Node.js server
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── index.js        # Server entry point
│   └── logs/               # Log files (created at runtime)
│
└── README.md               # This file
```

## Deployment

### Frontend Deployment

1. Build the production version:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the `dist` directory to your preferred static hosting service (Vercel, Netlify, GitHub Pages, etc.)

### Backend Deployment

1. Set up a production environment with Node.js
2. Configure environment variables in your hosting platform
3. Start the server with PM2 or similar process manager:
   ```bash
   cd server
   npm install --production
   npm start
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Unsplash](https://unsplash.com/) for sample images
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) for animations
- [React Icons](https://react-icons.github.io/react-icons/) for icons
