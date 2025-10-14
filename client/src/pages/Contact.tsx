import React, { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, Check, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

type FormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  eventCategory: string; // wedding, pre-wedding, etc.
  eventType: 'single' | 'multiple';
  eventDateStart: string; // yyyy-mm-dd
  eventDateEnd: string;   // yyyy-mm-dd (if multiple)
  message: string;
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const Contact = () => {
  const form = useRef<HTMLFormElement>(null);
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    location: '',
    eventCategory: 'Wedding',
    eventType: 'single',
    eventDateStart: '',
    eventDateEnd: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/media/list?path=contact/backgrounds`, { signal: controller.signal });
        const json = await res.json().catch(() => ({ items: [] }));
        if (json.items && json.items[0]) setBgUrl(json.items[0].url);
      } catch (_) {
        // silent fallback
      }
    })();
    return () => controller.abort();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.location.trim() || !formData.eventDateStart.trim()) {
      setError('Please fill in all required fields');
      setStatus('error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setStatus('error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        eventCategory: 'Wedding',
        eventType: 'single',
        eventDateStart: '',
        eventDateEnd: '',
        message: '',
      });
      
      // Reset form status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
      
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again later.');
      setStatus('error');
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-accent" />,
      title: 'Email',
      description: 'hello@theweddingshade.com',
    },
    {
      icon: <Phone className="w-6 h-6 text-accent" />,
      title: 'Phone',
      description: '+1 (555) 123-4567',
    },
  ];

  return (
    <div className="pt-24 pb-16">

      {/* Contact Form & Info */}
      <section className="relative py-20 md:py-32 bg-secondary">
        {/* Dark background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-secondary" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-secondary" />
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'radial-gradient(60% 60% at 50% 20%, rgba(139,115,85,0.05), transparent 60%)' 
            }} 
          />
        </div>
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-12 md:p-16 bg-primary/80 backdrop-blur-sm border border-border shadow-2xl">
                <h2 className="mb-4 text-center text-3xl md:text-4xl font-display font-light tracking-widest text-white">
                  INQUIRE
                </h2>
                <p className="text-cursive text-center mb-2">Photography Services</p>
                <p className="text-center text-muted mb-12 tracking-wide">Share your vision and we'll craft something extraordinary together.</p>
                
                {status === 'success' ? (
                  <motion.div 
                    className="p-4 mb-6 text-green-800 bg-green-100 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center">
                      <Check className="w-5 h-5 mr-2" />
                      <span>Your message has been sent successfully! I'll get back to you soon.</span>
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    className="p-4 mb-6 text-red-800 bg-red-100 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                ) : null}
                
                <form ref={form} onSubmit={handleSubmit} className="space-y-6" id="contact-form">
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block mb-2 text-sm font-medium text-slate-200">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-white placeholder-slate-400 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                        disabled={status === 'submitting'}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-200">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-white placeholder-slate-400 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                        disabled={status === 'submitting'}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone + Location */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="block mb-2 text-sm font-medium text-slate-200">Phone <span className="text-red-500">*</span></label>
                      <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 text-white placeholder-slate-400 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-accent" required />
                    </div>
                    <div>
                      <label htmlFor="location" className="block mb-2 text-sm font-medium text-slate-200">Event Location <span className="text-red-500">*</span></label>
                      <input type="text" id="location" name="location" placeholder="City / Venue" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 text-white placeholder-slate-400 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-accent" required />
                    </div>
                  </div>

                  {/* Event Category + Event Length */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="eventCategory" className="block mb-2 text-sm font-medium text-slate-200">Type of Event</label>
                      <select
                        id="eventCategory"
                        name="eventCategory"
                        value={formData.eventCategory}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-accent"
                      >
                        <option className="text-slate-900" value="Wedding">Wedding</option>
                        <option className="text-slate-900" value="Pre-wedding">Pre-wedding</option>
                        <option className="text-slate-900" value="Birthdays">Birthdays</option>
                        <option className="text-slate-900" value="Religious Events">Religious Events</option>
                        <option className="text-slate-900" value="Personal Events">Personal Events</option>
                        <option className="text-slate-900" value="Public Events">Public Events</option>
                        <option className="text-slate-900" value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-200">Event Length</label>
                      <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-md flex items-center gap-8 h-[48px]">
                        <label className="inline-flex items-center gap-2 text-slate-300 text-sm">
                          <input
                            type="radio"
                            name="eventType"
                            value="single"
                            checked={formData.eventType === 'single'}
                            onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as 'single' | 'multiple', eventDateEnd: '' }))}
                          />
                          Single Day
                        </label>
                        <label className="inline-flex items-center gap-2 text-slate-300 text-sm">
                          <input
                            type="radio"
                            name="eventType"
                            value="multiple"
                            checked={formData.eventType === 'multiple'}
                            onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as 'single' | 'multiple' }))}
                          />
                          Multiple Days
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="eventDateStart" className="block mb-2 text-sm font-medium text-slate-200">Start Date <span className="text-red-500">*</span></label>
                      <input type="date" id="eventDateStart" name="eventDateStart" value={formData.eventDateStart} onChange={handleChange} className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-accent" required />
                    </div>
                    <div>
                      <label htmlFor="eventDateEnd" className="block mb-2 text-sm font-medium text-slate-200">End Date</label>
                      <input type="date" id="eventDateEnd" name="eventDateEnd" value={formData.eventDateEnd} onChange={handleChange} disabled={formData.eventType === 'single'} className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-accent disabled:opacity-50 placeholder-slate-400" />
                    </div>
                  </div>

                  
                  <div>
                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-slate-200">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-white placeholder-slate-400 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                      disabled={status === 'submitting'}
                      required
                    ></textarea>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300 text-sm">
                    <input id="consent" name="consent" type="checkbox" className="mt-1" required />
                    <label htmlFor="consent">I agree to be contacted about my inquiry and understand this is not a booking confirmation.</label>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="flex items-center justify-center w-full px-6 py-4 text-sm font-medium text-white transition-colors rounded-md bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {status === 'submitting' ? (
                        <>
                          <svg className="w-5 h-5 mr-2 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Info Section (No Map) */}
            <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-black/40 border border-white/10 rounded">
                <h3 className="text-white font-semibold mb-2">How to Reach Us</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  {contactInfo.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/10">{item.icon}</span>
                      <span>{item.description}</span>
                    </li>
                  ))}
                  <li className="text-slate-400 text-xs pt-2">Average response: 24–48 hours</li>
                </ul>
              </div>
              <div className="p-6 bg-black/40 border border-white/10 rounded">
                <h3 className="text-white font-semibold mb-2">Services</h3>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• Weddings and Pre-weddings</li>
                  <li>• Small Events and Family Sessions</li>
                  <li>• Corporate and Brand Events</li>
                  <li>• Destination Coverage (on request)</li>
                </ul>
              </div>
              <div className="p-6 bg-black/40 border border-white/10 rounded">
                <h3 className="text-white font-semibold mb-2">Booking Notes</h3>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• Best to book 6–12 months (weddings)</li>
                  <li>• 2–4 weeks for smaller sessions</li>
                  <li>• Share date flexibility if possible</li>
                  <li>• Please include venue/city</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
