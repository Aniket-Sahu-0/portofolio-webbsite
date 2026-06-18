import React from 'react';
import HomeHero from '../components/home/HomeHero';
import HomeIntro from '../components/home/HomeIntro';
import HomeGalleryStrip from '../components/home/HomeGalleryStrip';
import HomeServices from '../components/home/HomeServices';

const Home = () => {
  return (
    <div className="bg-primary">
      <HomeHero />
      <HomeIntro />
      <HomeGalleryStrip />
      <HomeServices />
    </div>
  );
};

export default Home;
