import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Image as ImageIcon, User, Mail } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import HeroSlider from '../components/HeroSlider';
import AboutIntroSection from '../components/AboutIntroSection';
import FullWidthVideo from '../components/FullWidthVideo';
import AboutTeaser from '../components/AboutTeaser';
import ParallaxSection from '../components/ParallaxSection';
import PortfolioSlideshow from '../components/PortfolioSlideshow';
import WhyChooseUs from '../components/WhyChooseUs';

const Home = () => {
  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });


  return (
    <div>
      {/* New full-screen hero slider */}
      <HeroSlider />

      {/* About intro (text + photos) */}
      <AboutIntroSection />

      {/* Full Width Video Section */}
      <FullWidthVideo />

      {/* Scrolling panel About teaser */}
      <AboutTeaser />

      {/* Parallax Section */}
      <ParallaxSection />

      {/* Portfolio Slideshow Section (non-interactive) */}
      <PortfolioSlideshow />

      {/* Reviews marquee (single line) – sits above the global footer */}
      <WhyChooseUs />
    </div>
  );
};

export default Home;
