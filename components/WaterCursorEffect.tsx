import React, { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

const WaterCursorEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const addRipple = (x: number, y: number) => {
      // Increased max ripple count slightly for a richer effect
      if (ripples.current.length > 25) return;

      ripples.current.push({
        x,
        y,
        radius: 0,
        maxRadius: 50 + Math.random() * 30, // Larger rings than previous
        opacity: 0.4, // More visible initial opacity
        speed: 1.2 + Math.random() * 0.8, // Slightly faster expansion
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      const dx = clientX - lastMousePos.current.x;
      const dy = clientY - lastMousePos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Lowered distance threshold slightly for more frequent ripples
      if (distance > 30) {
        addRipple(clientX, clientY);
        lastMousePos.current = { x: clientX, y: clientY };
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const r = ripples.current[i];
        
        // Update
        r.radius += r.speed;
        r.opacity -= 0.012; // Fades out slightly slower than before

        if (r.opacity > 0) {
          // Draw primary ring
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 219, 154, ${r.opacity})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Secondary subtle inner ring
          if (r.radius > 8) {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 219, 154, ${r.opacity * 0.4})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Remove dead ripples
        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.current.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998] opacity-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default WaterCursorEffect;