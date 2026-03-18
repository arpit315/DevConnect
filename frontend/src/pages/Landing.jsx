import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    useEffect(() => {
        // Apply the dark theme to body specifically for landing
        document.documentElement.setAttribute('data-theme', 'dark');

        // Typing Effect
        const typingString = "Welcome to DevConnect 🚀";
        const typeTarget = document.getElementById('typing-text');
        let typingTimeout;

        if (typeTarget) {
            typeTarget.textContent = '';
            let typeIndex = 0;
            const typeWriter = () => {
                if (typeIndex < typingString.length) {
                    typeIndex++;
                    typeTarget.textContent = typingString.substring(0, typeIndex);
                    typingTimeout = setTimeout(typeWriter, 60);
                }
            };
            typingTimeout = setTimeout(typeWriter, 500);
        }


        return () => {
            document.documentElement.removeAttribute('data-theme');
            if (typingTimeout) clearTimeout(typingTimeout);
        }
    }, []);

    return (
        <div className="landing-page-container w-full relative overflow-hidden bg-[#030712] text-white min-h-screen">
            {/* Inline CSS for specific landing page animations/glows if they aren't in Tailwind */}
            <style>{`
                .landing-page-container {
                     font-family: 'Poppins', sans-serif;
                }
                .bg-blob {
                    position: absolute; filter: blur(90px); border-radius: 50%; width: 45vw; height: 45vw;
                    animation: floatBlob 25s infinite alternate ease-in-out; opacity: 0.15; z-index: 0; pointer-events: none;
                }
                .blob-1 { background: #4f46e5; top: -15%; left: -10%; }
                .blob-2 { background: #ec4899; bottom: -20%; right: -15%; animation-delay: -5s; animation-direction: alternate-reverse;}
                @keyframes floatBlob { 100% { transform: translate(15%, 15%) scale(1.1) rotate(20deg); } }
                
                .glass-hero {
                    background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(24px);
                    border-top: 1px solid rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
                }
                .gradient-text {
                    background: linear-gradient(to right, #4f46e5, #ec4899, #0ea5e9, #4f46e5);
                    -webkit-background-clip: text; color: transparent; background-size: 300% auto;
                    animation: textShine 6s linear infinite; display: inline-block;
                }
                @keyframes textShine { to { background-position: 300% center; } }
                .typing-cursor { display: inline-block; width: 3px; height: 1em; background-color: #4f46e5; animation: blink 0.8s infinite step-end; vertical-align: bottom; margin-left: 2px;}
                @keyframes blink { 50% { opacity: 0; } }
                .btn-glow {
                    background: linear-gradient(135deg, #4f46e5, #ec4899); color: #fff;
                    border: none; box-shadow: 0 5px 15px rgba(236, 72, 153, 0.3); transition: all 0.3s;
                }
                .btn-glow:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 10px 25px rgba(236, 72, 153, 0.5); }
                .icon-float { position: absolute; font-size: 3rem; filter: drop-shadow(0 0 20px rgba(255,255,255,0.3)); z-index: 1; opacity: 0.9;}
                .if-1 { top: 20%; left: 8%; animation: iconDrift 8s ease-in-out infinite; font-size: 3.5rem; }
                .if-2 { top: 65%; left: 12%; animation: iconDrift 9s ease-in-out infinite 1s; font-size: 4.5rem; filter: drop-shadow(0 0 30px rgba(236, 72, 153, 0.4));}
                .if-3 { top: 25%; right: 10%; animation: iconDrift 7s ease-in-out infinite 2s; font-size: 3.2rem; }
                .if-4 { top: 70%; right: 15%; animation: iconDrift 10s ease-in-out infinite 1.5s; font-size: 5rem; filter: drop-shadow(0 0 30px rgba(79, 70, 229, 0.4));}
                @keyframes iconDrift { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-30px) rotate(15deg); } }
            `}</style>

            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            {/* <div className="icon-float if-1">💻</div>
            <div class="icon-float if-2">⚡</div>
            <div class="icon-float if-3">🌐</div>
            <div class="icon-float if-4">🤝</div> */}

            <section className="flex flex-col justify-center items-center min-h-[85vh] pt-10 relative z-10 w-full">
                <div className="glass-hero w-full py-20 px-6 md:px-16 text-center transform transition-transform duration-300">
                    <div className="inline-block px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-widest mb-8 text-white bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border border-white/10 shadow-lg">
                        <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2 shadow-[0_0_10px_#10b981] animate-pulse"></span>
                        Live Developer Network
                    </div>

                    <h2 className="text-xl md:text-2xl font-medium text-indigo-500 mb-4 min-h-[36px]">
                        <span id="typing-text"></span><span className="typing-cursor"></span>
                    </h2>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                        The Professional Network for <br /><span className="gradient-text">Engineers</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Connect with elite developers, collaborate on open-source projects, and accelerate your career building world-class software.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/register" className="btn-glow px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2">
                            Get Started Free <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                        <Link to="/login" className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2">
                            Sign In <i className="fa-brands fa-github"></i>
                        </Link>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Landing;
