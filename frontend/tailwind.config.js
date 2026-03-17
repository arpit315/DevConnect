/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode if we add a toggle later
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#4F46E5", // Elegant Indigo
                    hover: "#4338CA",
                    light: "#818CF8",
                },
                secondary: "#0F172A", // Deep Slate / Almost Black
                accent: {
                    DEFAULT: "#EC4899", // Vibrant Pink accent
                    hover: "#DB2777",
                },
                surface: "#FFFFFF",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'], // Apple/Linear style typography
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-hover': '0 12px 48px 0 rgba(31, 38, 135, 0.12)',
                'neon': '0 0 20px rgba(79, 70, 229, 0.3)',
                'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
            },
            animation: {
                'blob': 'blob 10s infinite',
                'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
