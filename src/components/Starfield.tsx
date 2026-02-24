'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  large: boolean;
}

export default function Starfield() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generated: Star[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      large: Math.random() > 0.85,
    }));
    setStars(generated);
  }, []);

  return (
    <>
      <div className="nebula-bg" />
      <div className="starfield">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`star ${star.large ? 'large' : ''}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              ['--duration' as any]: `${star.duration}s`,
              ['--delay' as any]: `${star.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
