import React from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Image as ImageIcon } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Happy Clients', icon: User },
  { value: '5k+', label: 'Photos Taken', icon: Camera },
  { value: '100%', label: 'Satisfaction', icon: ImageIcon },
];

const StatsSection: React.FC = () => {
  return (
    <section className="bg-rich py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 text-accent">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="mb-2 text-4xl font-bold font-serif text-white">{stat.value}</h3>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
