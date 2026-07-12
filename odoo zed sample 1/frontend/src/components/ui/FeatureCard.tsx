import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: string;
  title: string;
  index: number;
}

export default function FeatureCard({ icon, title, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6 + index * 0.1, type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }}
      className="flex items-center space-x-3 px-4 py-3 rounded-2xl backdrop-blur-md border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default group"
      style={{
        boxShadow: '0 4px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <span className="text-xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
      <span className="text-sm font-medium text-blue-100/80 group-hover:text-blue-50 transition-colors">{title}</span>
    </motion.div>
  );
}
