'use client';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TiltProps {
  children: React.ReactNode;
  tiltMaxAngleX?: number;
  tiltMaxAngleY?: number;
  scale?: number;
  className?: string;
}

export function TiltCard({
  children,
  tiltMaxAngleX = 5,
  tiltMaxAngleY = 5,
  scale = 1.02,
  className = '',
}: TiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !isHovering) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const rotateX = ((mouseY - centerY) / (rect.height / 2)) * tiltMaxAngleX;
      const rotateY = ((mouseX - centerX) / (rect.width / 2)) * -tiltMaxAngleY;

      setTiltX(rotateX * -1);
      setTiltY(rotateY);
    };

    const handleMouseLeave = () => {
      setTiltX(0);
      setTiltY(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovering, tiltMaxAngleX, tiltMaxAngleY]);

  return (
    <motion.div
      ref={cardRef}
      className={className}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setTiltX(0);
        setTiltY(0);
      }}
      animate={{
        rotateX: tiltX,
        rotateY: tiltY,
        scale: isHovering ? scale : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
