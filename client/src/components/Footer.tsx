import { motion } from 'framer-motion';
import { Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'Mohitsahu1662@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/the_wedding_shade?igsh=MWQ2a3V1Ymh0ZzBtcA==';

const socialLinks = [
  { icon: <Instagram size={18} />, url: INSTAGRAM_URL, label: 'Instagram', external: true },
  { icon: <Mail size={18} />, url: `mailto:${CONTACT_EMAIL}`, label: 'Email', external: false },
];

const quickLinks = [
  { name: 'Home', url: '/' },
  { name: 'Gallery', url: '/gallery' },
  { name: 'About', url: '/about' },
  { name: 'Contact', url: '/contact' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-primary text-gray-300">
      {/* top hairline + soft warm glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(139,115,85,0.10),transparent_70%)]" />

      <div className="container relative z-10 pt-16">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="font-serif text-2xl tracking-[0.15em] text-white transition-colors hover:text-accent">
            The Wedding Shade
          </Link>
          <p className="mt-3 text-[0.7rem] uppercase tracking-[0.28em] text-gray-500">
            Cinematic Wedding Photography &amp; Film
          </p>

          {/* Socials */}
          <div className="mt-7 flex items-center gap-3">
            {socialLinks.map((s, i) => (
              <motion.a
                key={i}
                href={s.url}
                {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                whileHover={{ y: -2 }}
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-gray-300 transition-colors hover:border-accent hover:text-accent"
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[0.7rem] uppercase tracking-[0.22em] text-gray-400">
          {quickLinks.map((l) => (
            <Link key={l.name} to={l.url} className="transition-colors hover:text-accent">
              {l.name}
            </Link>
          ))}
        </nav>

        {/* Email */}
        <div className="mt-7 text-center">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-sm tracking-wide text-gray-300 transition-colors hover:text-accent break-all"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/10 py-6 text-[0.7rem] text-gray-500 sm:flex-row sm:justify-between">
          <p>© {currentYear} The Wedding Shade. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="transition-colors hover:text-gray-300">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-gray-300">Terms</Link>
          </div>
        </div>
      </div>

      {/* Giant faded site-name watermark (mirrors the About page treatment) */}
      <div className="pointer-events-none select-none overflow-hidden">
        <p className="whitespace-nowrap text-center font-serif text-[10vw] leading-[0.85] tracking-tight text-white/[0.04]">
          The Wedding Shade
        </p>
      </div>
    </footer>
  );
};

export default Footer;
