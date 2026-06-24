import React from 'react';
import HomeHero from '../components/home/HomeHero';
import HomeIntro from '../components/home/HomeIntro';
import HomeGalleryStrip from '../components/home/HomeGalleryStrip';
import HomeParallax from '../components/home/HomeParallax';
import HomeServices from '../components/home/HomeServices';

const Home = () => {
  return (
    <div className="bg-primary">
      <HomeHero />
      <HomeIntro />
      <HomeGalleryStrip />
      <HomeParallax />
      <HomeServices />
    </div>
  );
};

export default Home;
