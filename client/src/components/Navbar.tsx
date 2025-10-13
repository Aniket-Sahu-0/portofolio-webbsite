import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/60 backdrop-blur-md shadow-sm' // translucent when scrolled
          : 'bg-transparent' // fully transparent over hero
      }`}
    >
      <nav className="container flex items-center justify-between h-20">
        <Link
          to="/"
          className={`text-2xl font-bold font-serif ${
            isScrolled ? 'text-primary' : 'text-white'
          }`}
        >
          LensCraft
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`group relative px-2 py-1 text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-accent'
                  : isScrolled
                    ? 'text-gray-700 hover:text-accent'
                    : 'text-white hover:text-accent'
              }`}
            >
              {link.name}
              <span
                className={`pointer-events-none absolute left-0 -bottom-1 h-0.5 w-full origin-left transform bg-accent transition-transform duration-300 ${
                  location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </Link>
          ))}
          <Link
            to="/contact"
            className={`ml-4 btn ${
              isScrolled
                ? 'btn-primary'
                : 'bg-accent text-white hover:bg-accent/90 focus:ring-offset-0'
            }`}
          >
            Book a Session
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className={`p-2 md:hidden focus:outline-none ${
            isScrolled ? 'text-gray-700' : 'text-white'
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-sm overflow-hidden"
          >
            <div className="container py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 text-lg ${
                    location.pathname === link.path
                      ? 'text-accent font-medium'
                      : 'text-gray-800 hover:text-accent'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contact"
                className="inline-block mt-2 btn bg-accent text-white hover:bg-accent/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book a Session
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
