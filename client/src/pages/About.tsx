import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, MapPin, Clock, Camera, ChevronDown, ChevronUp } from 'lucide-react';

const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms
  const yContent = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityContent = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dynamic media from backend
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const API_HOST = useMemo(() => (API_BASE as string).replace(/\/api\/?$/, ''), [API_BASE]);
  const abs = useCallback((u: string | undefined | null) => (u ? (u.startsWith('/') ? `${API_HOST}${u}` : u) : ''), [API_HOST]);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [approachUrls, setApproachUrls] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [heroRes, approachRes] = await Promise.all([
          fetch(`${API_HOST}/api/media/list?path=heroes/about`, { signal: controller.signal }),
          fetch(`${API_HOST}/api/media/list?path=about/approach`, { signal: controller.signal }),
        ]);
        const heroJson = await heroRes.json().catch(() => ({ items: [] }));
        const approachJson = await approachRes.json().catch(() => ({ items: [] }));
        if (heroJson.items && heroJson.items[0]) setHeroUrl(abs(heroJson.items[0].url));
        if (approachJson.items && approachJson.items.length) {
          setApproachUrls(approachJson.items.map((it: { url: string }) => abs(it.url)));
        }
      } catch (_) {
        // silent fallback
      }
    }
    load();
    return () => controller.abort();
  }, [API_HOST]);

  // Organizational stats
  const stats = [
    { value: '8+', label: 'Years in Business', icon: Clock },
    { value: '500+', label: 'Events Covered', icon: Camera },
    { value: '50+', label: 'Cities Served', icon: MapPin },
    { value: '98%', label: 'Client Satisfaction', icon: Heart },
  ];

  // FAQ data
  const faqs = [
    {
      question: 'What is your photography style?',
      answer: 'We specialize in documentary-style photography that captures authentic, unposed moments. Our approach is unobtrusive and natural, focusing on real emotions and genuine interactions.'
    },
    {
      question: 'How far in advance should we book?',
      answer: 'We recommend booking 6-12 months in advance for weddings, and 2-4 weeks for other events. However, we often have last-minute availability, so feel free to reach out.'
    },
    {
      question: 'Do you travel for events?',
      answer: 'Yes, we cover events throughout the region and are available for destination photography. Travel fees may apply for locations beyond 50 miles from our base.'
    },
    {
      question: 'What is included in your packages?',
      answer: 'All packages include professional editing, online gallery delivery, and high-resolution digital files. Specific inclusions vary by package - contact us for detailed information.'
    },
    {
      question: 'How long until we receive our photos?',
      answer: 'Standard turnaround is 2-3 weeks for events and 1-2 weeks for portrait sessions. We provide a preview gallery within 48 hours for weddings and major events.'
    },
    {
      question: 'Do you offer engagement sessions?',
      answer: 'Yes, engagement sessions are available as standalone bookings or as part of wedding packages. They\'re a great way to get comfortable with our team before your big day.'
    }
  ];

  // Services overview
  const services = [
    { name: 'Weddings', description: 'Complete day coverage with documentary approach' },
    { name: 'Corporate Events', description: 'Professional event documentation and branding' },
    { name: 'Family Sessions', description: 'Lifestyle portraits in natural settings' },
    { name: 'Special Occasions', description: 'Birthdays, anniversaries, celebrations' },
  ];

  return (
    <div className="bg-rich">
      {/* Parallax Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Fixed Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed mono"
          style={{
            backgroundImage: heroUrl ? `url('${heroUrl}')` : undefined
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70" />
        
        {/* Moving Content */}
        <motion.div 
          className="relative z-10 h-full flex items-center justify-center text-center px-4"
          style={{ y: yContent, opacity: opacityContent }}
        >
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div 
                className="text-xs tracking-[0.4em] uppercase text-accent/90 mb-6 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                About Us
              </motion.div>
              <motion.h1 
                className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-6 sm:mb-8 leading-tight sm:leading-[0.9] tracking-tight px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                Documentary<br />
                <span className="text-slate-400 font-light italic">Storytellers</span>
              </motion.h1>
              <motion.p 
                className="text-slate-300 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-light px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                Professional photography team specializing in authentic moments and genuine connections
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 text-accent">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-slate-400 text-sm md:text-base tracking-wide">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="text-xs tracking-[0.4em] uppercase text-accent/90 mb-4 font-medium">Our Approach</div>
            <h2 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
              Authentic Storytelling
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
              We believe the best photographs happen when people forget the camera is there. 
              Our documentary approach captures genuine emotions and real connections.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="font-serif text-2xl md:text-3xl text-white mb-6">What Sets Us Apart</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Unobtrusive Style</h4>
                    <p className="text-slate-400 text-sm">We blend into your event, capturing natural moments without interruption.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Professional Team</h4>
                    <p className="text-slate-400 text-sm">Experienced photographers who understand timing and composition.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Quick Turnaround</h4>
                    <p className="text-slate-400 text-sm">Fast delivery without compromising on quality or attention to detail.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {approachUrls.length >= 4 ? (
                <>
                  <div className="space-y-4">
                    <img src={approachUrls[0]} alt="Behind the scenes" className="w-full aspect-[4/5] object-cover rounded mono" />
                    <img src={approachUrls[1]} alt="Team at work" className="w-full aspect-square object-cover rounded mono" />
                  </div>
                  <div className="space-y-4 mt-8">
                    <img src={approachUrls[2]} alt="Equipment setup" className="w-full aspect-square object-cover rounded mono" />
                    <img src={approachUrls[3]} alt="Client interaction" className="w-full aspect-[4/5] object-cover rounded mono" />
                  </div>
                </>
              ) : null}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="text-xs tracking-[0.4em] uppercase text-accent/90 mb-4 font-medium">Services</div>
            <h2 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
              What We Offer
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 bg-black/20 rounded border border-white/5 hover:border-accent/30 transition-colors duration-300"
              >
                <h3 className="font-serif text-2xl text-white mb-3">{service.name}</h3>
                <p className="text-slate-400 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[800px] mx-auto px-6 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="text-xs tracking-[0.4em] uppercase text-accent/90 mb-4 font-medium">FAQ</div>
            <h2 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
              Common Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="border border-white/10 rounded overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left bg-black/20 hover:bg-black/30 transition-colors duration-300 flex items-center justify-between"
                >
                  <h3 className="font-medium text-white text-lg">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-accent flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-accent flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 bg-black/10"
                  >
                    <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-4xl md:text-6xl text-white mb-8 leading-tight">
              Ready to Work Together?
            </h2>
            <p className="text-slate-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Let's discuss your event and how we can capture your story authentically.
            </p>
            <motion.a
              href="/contact"
              className="group inline-flex items-center px-12 py-4 text-sm font-medium text-white bg-transparent border border-accent/40 hover:border-accent/80 hover:bg-accent/5 transition-all duration-500 uppercase tracking-[0.2em] rounded-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="group-hover:tracking-[0.3em] transition-all duration-300">
                Get in Touch
              </span>
              <motion.div
                className="ml-3 w-0 group-hover:w-4 transition-all duration-300 overflow-hidden"
                initial={{ x: -10, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
              >
                →
              </motion.div>
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
