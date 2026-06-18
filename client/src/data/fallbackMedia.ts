export type MediaCategory =
  | 'hero'
  | 'intro'
  | 'portfolio'
  | 'gallery'
  | 'galleryWides'
  | 'galleryHero'
  | 'aboutTeaser'
  | 'about'
  | 'contact';

export const fallbackMedia: Record<MediaCategory, string[]> = {
  hero: [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=82',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1920&q=82',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1920&q=82',
  ],
  intro: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=76',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=76',
    'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=1000&q=76',
    'https://images.unsplash.com/photo-1509610973147-232dfea52a97?auto=format&fit=crop&w=1000&q=76',
  ],
  portfolio: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=76',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=76',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=76',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=76',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=76',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=76',
  ],
  gallery: [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=72',
    'https://images.unsplash.com/photo-1460364157752-926555421a7e?auto=format&fit=crop&w=900&q=72',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=72',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=72',
    'https://images.unsplash.com/photo-1509610973147-232dfea52a97?auto=format&fit=crop&w=900&q=72',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=72',
  ],
  galleryWides: [
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=76',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=76',
  ],
  galleryHero: [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=82',
  ],
  aboutTeaser: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=900',
  ],
  about: [
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=76',
  ],
  contact: [
    'https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=1200&q=76',
  ],
};
