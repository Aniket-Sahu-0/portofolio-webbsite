import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute w-full h-full border-4 border-accent/20 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute w-full h-full border-4 border-transparent border-t-accent rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
        <motion.p 
          className="mt-6 text-lg font-medium text-gray-600"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Loading;
