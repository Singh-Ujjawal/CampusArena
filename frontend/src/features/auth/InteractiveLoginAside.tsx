import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const InteractiveLoginAside: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorGlowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if cursor is inside the container
            const isInside =
                x >= 0 && x <= rect.width &&
                y >= 0 && y <= rect.height;

            if (isInside && cursorRef.current) {
                // Animate cursor to mouse position
                gsap.to(cursorRef.current, {
                    x: x - 12,
                    y: y - 12,
                    duration: 0.2,
                    ease: 'power2.out',
                });

                // Animate glow circle
                gsap.to(cursorGlowRef.current, {
                    x: x - 25,
                    y: y - 25,
                    duration: 0.4,
                    ease: 'power2.out',
                });
            }
        };

        const handleMouseEnter = () => {
            if (cursorRef.current && cursorGlowRef.current) {
                gsap.to([cursorRef.current, cursorGlowRef.current], {
                    opacity: 1,
                    duration: 0.3,
                });
            }
        };

        const handleMouseLeave = () => {
            if (cursorRef.current && cursorGlowRef.current) {
                gsap.to([cursorRef.current, cursorGlowRef.current], {
                    opacity: 0,
                    duration: 0.3,
                });
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseenter', handleMouseEnter);
            container.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseenter', handleMouseEnter);
                container.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);
    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col justify-between text-white overflow-hidden relative cursor-none"
            style={{
                backgroundImage: 'url(/login.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Custom Cursor Glow */}
            <div
                ref={cursorGlowRef}
                className="fixed pointer-events-none opacity-0"
                style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(142, 202, 230, 0.3) 0%, transparent 70%)',
                    boxShadow: '0 0 30px rgba(142, 202, 230, 0.4)',
                    filter: 'blur(8px)',
                    zIndex: 40,
                }}
            />

            {/* Custom Cursor */}
            <div
                ref={cursorRef}
                className="fixed pointer-events-none opacity-0"
                style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid #8ECAE6',
                    boxShadow: '0 0 15px rgba(142, 202, 230, 0.8), inset 0 0 8px rgba(142, 202, 230, 0.5)',
                    zIndex: 50,
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        width: '4px',
                        height: '4px',
                        backgroundColor: '#8ECAE6',
                        borderRadius: '50%',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            </div>
            {/* Content - Logo and Name */}
            

            {/* Center Content - Full Image Background */}
            <div className="text-center flex flex-col items-center justify-center">
            </div>

            {/* Bottom - Footer */}
            <div className="text-center">
                <p className="text-xs font-light tracking-widest" style={{ color: '#4B7BA7' }}>
                    © {new Date().getFullYear()} CAMPUSARENA
                </p>
            </div>
        </div>
    );
};

export default InteractiveLoginAside;
