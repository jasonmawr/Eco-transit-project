'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function MotionFlowBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false); // Make sure it transitions cleanly
    setMounted(true);
  }, []);

  // Config leaf shapes to float around
  const leaves = [
    { left: '8%', top: '20%', size: 12, delay: 0, rotate: 15 },
    { left: '88%', top: '15%', size: 14, delay: 1, rotate: -45 },
    { left: '45%', top: '75%', size: 10, delay: 2, rotate: 60 },
    { left: '15%', top: '65%', size: 15, delay: 1.5, rotate: -20 },
    { left: '82%', top: '80%', size: 12, delay: 0.5, rotate: 35 }
  ];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none grain-overlay">
      
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-eco-bgBeige/65 via-white to-eco-soft" />

      {/* SVG Motion Flow Curves */}
      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" preserveAspectRatio="none">
        
        {/* Dynamic Wave 1 */}
        {mounted ? (
          <motion.path
            d="M 0,250 C 360,150 720,350 1080,200 L 1440,120 L 1440,600 L 0,600 Z"
            fill="rgba(0, 102, 255, 0.025)"
            animate={{
              d: [
                "M 0,250 C 360,150 720,350 1080,200 L 1440,120 L 1440,600 L 0,600 Z",
                "M 0,280 C 400,200 800,310 1120,240 L 1440,150 L 1440,600 L 0,600 Z",
                "M 0,250 C 360,150 720,350 1080,200 L 1440,120 L 1440,600 L 0,600 Z"
              ]
            }}
            transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
          />
        ) : (
          <path
            d="M 0,250 C 360,150 720,350 1080,200 L 1440,120 L 1440,600 L 0,600 Z"
            fill="rgba(0, 102, 255, 0.025)"
          />
        )}

        {/* Dynamic Wave 2 (Connected Bus Path) */}
        <path
          d="M 0,380 C 300,450 600,280 900,350 L 1440,300"
          fill="none"
          stroke="#9FCE1A"
          strokeWidth="3.5"
          className="animate-dash-flow opacity-40"
        />

        {/* Dynamic Wave 3 (Connected Metro Path) */}
        {mounted ? (
          <motion.path
            d="M 100,120 C 500,60 900,220 1300,150"
            fill="none"
            stroke="#0066FF"
            strokeWidth="4.5"
            className="opacity-25"
            animate={{
              d: [
                "M 100,120 C 500,60 900,220 1300,150",
                "M 100,140 C 480,100 880,190 1300,170",
                "M 100,120 C 500,60 900,220 1300,150"
              ]
            }}
            transition={{ duration: 15, ease: 'easeInOut', repeat: Infinity }}
          />
        ) : (
          <path
            d="M 100,120 C 500,60 900,220 1300,150"
            fill="none"
            stroke="#0066FF"
            strokeWidth="4.5"
            className="opacity-25"
          />
        )}
      </svg>

      {/* Floating Leaf Accents */}
      {mounted && leaves.map((leaf, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            left: leaf.left,
            top: leaf.top,
            width: leaf.size,
            height: leaf.size,
          }}
          animate={{
            y: [0, -10, 0],
            rotate: [leaf.rotate, leaf.rotate + 15, leaf.rotate],
          }}
          transition={{
            duration: 5 + index,
            delay: leaf.delay,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          className="text-eco-accentGreenDeep opacity-35"
        >
          {/* Leaf mini SVG */}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L2.18,20.66C4.26,15.49 6.7,8.2 17,6C19.5,5.5 22,7 22,7C22,7 19.5,7.5 17,8Z" />
          </svg>
        </motion.div>
      ))}

    </div>
  );
}
