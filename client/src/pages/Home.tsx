import React, { useEffect, useState } from 'react';
import HomeHero from '../components/home/HomeHero';
import HomeIntro from '../components/home/HomeIntro';
import HomeGalleryStrip from '../components/home/HomeGalleryStrip';
import HomeParallax from '../components/home/HomeParallax';
import HomeServices from '../components/home/HomeServices';
import PageLoader from '../components/PageLoader';
import MobileEnquireBar from '../components/home/MobileEnquireBar';

const Home = () => {
  const [ready, setReady] = useState(false);

  // Reveal the page once the hero image has loaded. Safety timeout guarantees we
  // never trap the user behind the loader if the hero is slow or fails.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-primary">
      <PageLoader visible={!ready} />
      <HomeHero onReady={() => setReady(true)} />
      <HomeIntro />
      <HomeGalleryStrip />
      <HomeParallax />
      <HomeServices />
      <MobileEnquireBar />
    </div>
  );
};

export default Home;
