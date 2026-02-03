import React, { useEffect, useState, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  const mousePos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => setIsActive(true);
    const onMouseUp = () => setIsActive(false);
    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') || 
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer');
      
      setIsHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    // Animation Loop for performance
    let animationFrame: number;
    const render = () => {
      // Inner dot follows instantly
      dotPos.current.x = mousePos.current.x;
      dotPos.current.y = mousePos.current.y;

      // Outer ring follows with easing (lerp)
      const lerpFactor = 0.15;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, [isVisible]);

  return (
    <div 
      className={`hidden lg:block pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Outer Ring */}
      <div 
        ref={ringRef}
        className="absolute top-0 left-0 -ml-[16px] -mt-[16px] rounded-full border-2 transition-[width,height,background-color,border-color,scale] duration-300 ease-out will-change-transform"
        style={{
          width: isHovered ? '64px' : '32px',
          height: isHovered ? '64px' : '32px',
          marginLeft: isHovered ? '-32px' : '-16px',
          marginTop: isHovered ? '-32px' : '-16px',
          backgroundColor: isHovered ? 'rgba(0, 219, 154, 0.1)' : 'transparent',
          borderColor: isHovered ? 'rgba(0, 219, 154, 0.8)' : 'rgba(0, 219, 154, 0.3)',
          transform: `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${isActive ? 0.8 : 1})`,
        }}
      ></div>
      
      {/* Inner Dot */}
      <div 
        ref={dotRef}
        className="absolute top-0 left-0 -ml-[4px] -mt-[4px] w-2 h-2 bg-primary rounded-full will-change-transform transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) scale(${isHovered ? 0 : 1})`,
        }}
      ></div>
    </div>
  );
};

export default CustomCursor;