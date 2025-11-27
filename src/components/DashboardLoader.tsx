import { motion } from 'framer-motion'

export default function DashboardLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#702ABD]/5 via-[#305FB3]/5 to-[#2F7EC0]/5" />
      
      {/* Main loader container */}
      <div className="relative flex flex-col items-center gap-8 z-10">
        
        {/* Animated circles loader */}
        <div className="relative w-40 h-40">
          {/* Outer rotating circle */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#702ABD]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle rotating circle */}
          <motion.div
            className="absolute inset-4 rounded-full border-4 border-transparent border-r-[#305FB3]"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner rotating circle */}
          <motion.div
            className="absolute inset-8 rounded-full border-4 border-transparent border-b-[#2F7EC0]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center pulsing dot */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#702ABD] to-[#305FB3]" />
          </motion.div>
          
          {/* Orbiting dots */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
              style={{
                background: i % 3 === 0 ? '#702ABD' : i % 3 === 1 ? '#305FB3' : '#2F7EC0',
                boxShadow: `0 0 10px ${i % 3 === 0 ? '#702ABD' : i % 3 === 1 ? '#305FB3' : '#2F7EC0'}`,
              }}
              animate={{
                rotate: 360,
                x: [-50, -50],
                y: [-50, -50],
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.5 },
              }}
              initial={{
                rotate: i * 60,
                x: 60 * Math.cos((i * 60 * Math.PI) / 180) - 6,
                y: 60 * Math.sin((i * 60 * Math.PI) / 180) - 6,
              }}
            />
          ))}
        </div>

        {/* Brand text with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#702ABD] via-[#305FB3] to-[#2F7EC0] bg-clip-text text-transparent">
            ScalingWolf
          </h2>
          
          {/* Animated dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: i === 0 ? '#702ABD' : i === 1 ? '#305FB3' : '#2F7EC0' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Preparing your dashboard...
          </motion.p>
        </motion.div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#702ABD] via-[#305FB3] to-[#2F7EC0]"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 3 === 0 ? '#702ABD' : i % 3 === 1 ? '#305FB3' : '#2F7EC0',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}