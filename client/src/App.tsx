import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StatsSection from './components/StatsSection';
import ScrollOnRouteChange from './components/ScrollOnRouteChange';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

const App = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <ScrollOnRouteChange />
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {location.pathname !== '/about' && <StatsSection />}
      {location.pathname !== '/about' && <Footer />}
    </div>
  );
};

// Mount Lenis only on non-home routes — Home has its own wheel hijacking for
// the stacked panels and Lenis's preventDefault conflicts with it even when stopped.
const InnerWrapper = () => {
  const location = useLocation();

  if (location.pathname === '/') {
    return <App />;
  }

  return (
    <ReactLenis root options={{ lerp: 0.18, smoothWheel: true }}>
      <App />
    </ReactLenis>
  );
};

const AppWrapper = () => (
  <Router>
    <InnerWrapper />
  </Router>
);

export default AppWrapper;
