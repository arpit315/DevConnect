import React, { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ImageGallery = ({ images, onClose, title }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-fade-in p-4 sm:p-10" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-[110]"
            >
                <FiX className="w-8 h-8" />
            </button>

            <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                            }}
                            className="absolute left-0 sm:-left-16 text-white/50 hover:text-white transition-all p-3 hover:scale-110 z-[110]"
                        >
                            <FiChevronLeft className="w-12 h-12" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                            }}
                            className="absolute right-0 sm:-right-16 text-white/50 hover:text-white transition-all p-3 hover:scale-110 z-[110]"
                        >
                            <FiChevronRight className="w-12 h-12" />
                        </button>
                    </>
                )}

                {/* Main Image */}
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                        src={images[activeIndex]}
                        alt={title || "Gallery"}
                        className="max-w-full max-h-full object-contain animate-scale-in"
                    />

                    {/* Image Counter */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold border border-white/10">
                        {activeIndex + 1} / {images.length}
                    </div>
                </div>
            </div>

            {/* Thumbnails Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 max-w-[90vw] overflow-x-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeIndex === idx ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
