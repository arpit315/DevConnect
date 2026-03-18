import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiHeart, FiMessageSquare, FiShare2, FiImage, FiSend, FiMoreHorizontal, FiBriefcase, FiX } from 'react-icons/fi';
import ImageGallery from '../components/ImageGallery';

const Home = () => {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [creatingPost, setCreatingPost] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]); // Array of File objects
    const [galleryData, setGalleryData] = useState(null); // { images: [], title: "" }

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await api.get('/posts/feed');
                setPosts(response.data.data.posts);
            } catch (error) {
                console.error("Failed to fetch feed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setCreatingPost(true);
        try {
            const formData = new FormData();
            formData.append('content', newPostContent);
            if (selectedImages.length > 0) {
                selectedImages.forEach(img => formData.append('images', img));
            }

            const response = await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newPost = { ...response.data.data, isNew: true };
            setPosts([newPost, ...posts]);
            setNewPostContent('');
            setSelectedImages([]);
            toast.success("Post created successfully");

            setTimeout(() => {
                setPosts(current => current.map(p => p._id === newPost._id ? { ...p, isNew: false } : p));
            }, 1000);

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create post");
        } finally {
            setCreatingPost(false);
        }
    };

    const handleLike = async (postId) => {
        if (!user) {
            toast.error("Sign in to like this post");
            return;
        }

        try {
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const isLiked = post.likes.includes(user._id);
                    return {
                        ...post,
                        likes: isLiked
                            ? post.likes.filter(id => id !== user._id)
                            : [...post.likes, user._id],
                        justLiked: !isLiked
                    };
                }
                return post;
            }));

            setTimeout(() => {
                setPosts(current => current.map(p => p._id === postId ? { ...p, justLiked: false } : p));
            }, 400);

            await api.post(`/posts/${postId}/like`);
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
        }
    };

    return (
        <div className="w-full relative flex flex-col items-center py-10 z-10 min-h-screen">
            <div className="w-full max-w-[680px] px-4 sm:px-0">
                {/* Ambient Background Glows */}
                <div className="fixed top-20 left-10 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob pointer-events-none -z-10"></div>
                <div className="fixed top-40 right-10 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>

                {/* Main Welcome Hero (Unauthenticated) */}
                {!user && (
                    <div className="glass-card rounded-[2rem] p-12 mb-12 text-center overflow-hidden relative animate-fade-in-up">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-[100px] pointer-events-none"></div>

                        <div className="inline-flex items-center justify-center p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-6 shadow-inner ring-1 ring-white">
                            <FiBriefcase className="w-8 h-8 text-primary" />
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-secondary mb-4 leading-tight">
                            The Professional Network <br /> for <span className="text-gradient">Engineers</span>
                        </h1>

                        <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto font-medium">
                            Share your open-source work, discover incredible projects, and connect with top-tier developers worldwide.
                        </p>

                        <div className="flex sm:flex-row flex-col items-center justify-center gap-4">
                            <Link to="/register" className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base">
                                Join the Community
                            </Link>
                            <Link to="/login" className="btn-outline w-full sm:w-auto px-8 py-3.5 text-base">
                                Sign In
                            </Link>
                        </div>
                    </div>
                )}

                {/* App Header (Authenticated) */}
                {user && (
                    <div className="mb-6 animate-fade-in-up">
                        <h2 className="text-2xl font-bold tracking-tight text-secondary">Home</h2>
                        <p className="text-slate-500 font-medium">What's on your mind today?</p>
                    </div>
                )}

                {/* Create Post Interface */}
                {user && (
                    <div className="glass-card rounded-3xl p-6 mb-10 animate-fade-in-up stagger-1">
                        <div className="flex gap-4 items-start">
                            <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                            />
                            <form className="flex-1" onSubmit={handleCreatePost}>
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-primary/20 rounded-2xl p-4 text-[15px] outline-none transition-all duration-300 shadow-inner resize-none min-h-[100px]"
                                    placeholder="Share a project, thought, or snippet..."
                                ></textarea>

                                <div className="mt-4">
                                    {/* Image Previews */}
                                    {selectedImages.length > 0 && (
                                        <div className="mb-4 grid grid-cols-4 gap-2">
                                            {selectedImages.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group/img">
                                                    <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <FiX className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="file"
                                                id="post-images"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    if (selectedImages.length + files.length > 4) {
                                                        toast.error("You can only upload up to 4 images per post");
                                                        return;
                                                    }
                                                    setSelectedImages([...selectedImages, ...files]);
                                                }}
                                            />
                                            <label htmlFor="post-images" className="text-slate-500 hover:text-primary hover:bg-primary/5 p-2 rounded-xl transition-all flex items-center gap-2 group cursor-pointer">
                                                <div className="bg-slate-100 group-hover:bg-white p-1.5 rounded-lg shadow-sm">
                                                    <FiImage className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="text-sm font-semibold">Media</span>
                                                {selectedImages.length > 0 && <span className="text-xs bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center font-bold">{selectedImages.length}</span>}
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={creatingPost || !newPostContent.trim()}
                                            className="btn-primary py-2 px-5 gap-2"
                                        >
                                            {creatingPost ? (
                                                <span className="animate-pulse">Posting...</span>
                                            ) : (
                                                <>
                                                    <span>Post</span>
                                                    <FiSend className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modern Feed Stream */}
                {user && (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin shadow-lg"></div>
                                <p className="text-slate-400 font-medium animate-pulse">Loading feed...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20 glass-card rounded-3xl animate-fade-in-up stagger-2">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl rotate-3 mx-auto mb-6 flex items-center justify-center shadow-inner border border-slate-100">
                                    <FiMessageSquare className="w-8 h-8 text-slate-400 rotate-[-3deg]" />
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-2">The feed is empty</h3>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto">Be the first to share an update or project snippet.</p>
                            </div>
                        ) : (
                            posts.map((post, index) => (
                                <article
                                    key={post._id}
                                    className={` glass-card rounded-3xl p-6 sm:p-7 ${post.isNew ? 'animate-fade-in-up border-primary/20 shadow-neon' : `animate-fade-in-up stagger-${index > 3 ? 1 : index + 1}`}`}
                                >
                                    {/* Author Top Row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3.5 group">
                                            <div className="relative">
                                                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-accent rounded-full opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                                                <img
                                                    src={post.author.avatar}
                                                    alt={post.author.fullName}
                                                    className="relative w-12 h-12 rounded-full object-cover shadow-sm bg-white"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[15px] text-secondary group-hover:text-primary transition-colors tracking-tight">
                                                    {post.author.fullName}
                                                </h4>
                                                <div className="text-[13px] font-medium text-slate-400 mt-0.5 tracking-wide">
                                                    @{post.author.username} • {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </Link>

                                        <button className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors opacity-0 group-hover:opacity-100 md:opacity-100">
                                            <FiMoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <p className="text-[15px] leading-[1.6] text-slate-700 whitespace-pre-wrap mb-4 font-medium tracking-wide">
                                        {post.content}
                                    </p>

                                    {/* Media Attachment Grid */}
                                    {(post.images && post.images.length > 0) && (
                                        <div
                                            className={`mt-4 mb-4 grid gap-2 rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer hover:opacity-95 transition-opacity ${post.images.length === 1 ? 'grid-cols-1' :
                                                post.images.length === 2 ? 'grid-cols-2' :
                                                    'grid-cols-2'
                                                }`}
                                            onClick={() => setGalleryData({ images: post.images, title: "Post Gallery" })}
                                        >
                                            {post.images.slice(0, 4).map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`relative group overflow-hidden ${post.images.length === 3 && idx === 0 ? 'row-span-2 h-full' : 'h-48'
                                                        } ${post.images.length === 1 ? 'h-auto max-h-[500px]' : ''}`}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`Post content ${idx}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    {post.images.length > 4 && idx === 3 && (
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl backdrop-blur-[2px]">
                                                            +{post.images.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Legacy single image support */}
                                    {(!post.images || post.images.length === 0) && post.image && (
                                        <div
                                            className="mt-4 mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer"
                                            onClick={() => setGalleryData({ images: [post.image], title: "Post Image" })}
                                        >
                                            <img src={post.image} alt="Attachment" className="w-full max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-500" />
                                        </div>
                                    )}

                                    {/* Tag Chips */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="text-xs font-bold tracking-wider text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
                                                    {tag.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="border-t border-slate-100 my-4"></div>

                                    {/* Interaction Bar */}
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${user && post.likes.includes(user._id)
                                                ? 'text-accent bg-accent/5 shadow-inner border border-accent/10'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-secondary'
                                                }`}
                                        >
                                            <FiHeart className={`w-5 h-5 transition-transform duration-300 ${post.justLiked ? 'scale-[1.3] fill-current text-accent' : ''} ${user && post.likes.includes(user._id) ? 'fill-current' : 'group-hover:scale-110'}`} />
                                            <span>{post.likes.length > 0 ? post.likes.length : 'Like'}</span>
                                        </button>

                                        <button className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-secondary transition-all duration-300 group">
                                            <FiMessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span>Comment</span>
                                        </button>

                                        <button className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-secondary transition-all duration-300 group">
                                            <FiShare2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                )}

                {/* Reusable Image Gallery Modal */}
                {galleryData && (
                    <ImageGallery
                        images={galleryData.images}
                        title={galleryData.title}
                        onClose={() => setGalleryData(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;
