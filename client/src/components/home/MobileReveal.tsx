import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

// Static wrapper for the mobile/touch layouts of the home scroll sections
// (HomeIntro / HomeServices). Intentionally renders NO motion — the mobile
// design is fully static (no fade, no scrub) so there's zero animation overhead
// or "laggy" feel on phones. Kept as a named component so the section call sites
// stay readable and a reveal could be reintroduced in one place if ever wanted.
const MobileReveal: React.FC<Props> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export default MobileReveal;
