import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Instagram size={24} />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <Facebook size={24} />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter size={24} />, url: 'https://twitter.com', label: 'Twitter' },
  ];

  const quickLinks = [
    { name: 'Home', url: '/' },
    { name: 'Gallery', url: '/gallery' },
    { name: 'About', url: '/about' },
    { name: 'Contact', url: '/contact' },
  ];

  return (
    <footer className="bg-rich text-gray-300 pt-14 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10 justify-items-center md:justify-items-stretch text-center md:text-left">
          {/* Brand + Social */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-white mb-3">The Wedding Shade</h3>
            <p className="mb-6 text-gray-400 max-w-sm">
              Capturing stories worldwide.
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-5">
              {socialLinks.map((s, i) => (
                <motion.a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-accent transition-colors"
                  whileHover={{ y: -2 }}
                  aria-label={s.label}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name} className="flex justify-center md:justify-start">
                  <Link 
                    to={link.url} 
                    className="text-gray-400 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start justify-center md:justify-start">
                <Mail className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                <span>hello@theweddingshade.com</span>
              </li>
              <li className="flex items-start justify-center md:justify-start">
                <Phone className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>

          {/* Brand logo on far right */}
          <div className="w-full flex justify-center md:justify-end md:text-right">
            {/* Inline simple brand mark (replace with your SVG/logo later) */}
            <div className="inline-flex items-center space-x-3 justify-self-end">
              <svg
                width="40"
                height="40"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="rounded-full shadow-sm"
              >
                <circle cx="24" cy="24" r="24" fill="#b87333" />
                <path d="M16 30V18h6.5a4.5 4.5 0 010 9H19v3h-3zm14-12h3v12h-3l-5-7.2V30h-3V18h3l5 7.2V18z" fill="#0f172a" />
              </svg>
              <div className="text-left">
                <div className="text-white font-serif font-bold text-lg leading-tight">The Wedding Shade</div>
                <div className="text-gray-400 text-xs">Documentary Studio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-center">
          <p className="text-gray-500 text-sm">&copy; {currentYear} The Wedding Shade. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-300">Privacy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-300">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
