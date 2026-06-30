import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

// Slim mobile-only sticky CTA for the home page — keeps "Enquire" one tap away
// while browsing. Hides itself once the footer scrolls into view (the footer has
// its own contact), so it never covers footer content. `md:hidden` = phones only.
const MobileEnquireBar: React.FC = () => {
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setAtFooter(entry.isIntersecting),
      { rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 transition-transform duration-300 md:hidden ${
        atFooter ? 'translate-y-[160%]' : 'translate-y-0'
      }`}
    >
      <div className="flex items-center justify-between gap-3 rounded-full border border-white/10 bg-primary/80 px-5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <span className="text-[0.7rem] uppercase tracking-[0.22em] text-light/70">Now booking 2026</span>
        <Link
          to="/contact"
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.15em] text-white"
        >
          Enquire <Mail size={14} />
        </Link>
      </div>
    </div>
  );
};

export default MobileEnquireBar;
