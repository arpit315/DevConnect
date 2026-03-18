import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiGithub, FiLinkedin, FiTwitter, FiGlobe, FiEdit2, FiX, FiLayers, FiMessageSquare, FiHeart, FiShare2, FiMoreHorizontal, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ImageGallery from '../components/ImageGallery';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuthStore();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [editData, setEditData] = useState({ fullName: '', bio: '', techStack: '', github: '', linkedin: '', twitter: '' });
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);

    // Project States
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', githubUrl: '', liveUrl: '', images: [] });
    const [savingProject, setSavingProject] = useState(false);

    // Gallery States
    const [galleryData, setGalleryData] = useState(null); // { images: [], title: "" }

    // Avatar upload logic
    const fileInputRef = useRef(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (isOwnProfile) {
                    setProfileUser(currentUser);
                    setEditData({
                        fullName: currentUser.fullName,
                        bio: currentUser.bio || '',
                        techStack: currentUser.techStack?.join(', ') || '',
                        github: currentUser.github || '',
                        linkedin: currentUser.linkedin || '',
                        twitter: currentUser.twitter || '',
                    });
                } else {
                    const res = await api.get(`/users/profile/${username}`);
                    setProfileUser(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching profile", error);
                toast.error("User not found");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username, isOwnProfile, currentUser]);

    useEffect(() => {
        if (activeTab === 'posts' && profileUser) {
            const fetchUserPosts = async () => {
                setPostsLoading(true);
                try {
                    const res = await api.get(`/posts/user/${profileUser.username}`);
                    setPosts(res.data.data);
                } catch (error) {
                    console.error("Failed to fetch user posts", error);
                } finally {
                    setPostsLoading(false);
                }
            };
            fetchUserPosts();
        }
    }, [activeTab, profileUser]);

    useEffect(() => {
        if (profileUser) {
            const fetchUserProjects = async () => {
                setProjectsLoading(true);
                try {
                    const res = await api.get(`/projects/user/${profileUser.username}`);
                    setProjects(res.data.data);
                } catch (error) {
                    console.error("Failed to fetch user projects", error);
                } finally {
                    setProjectsLoading(false);
                }
            };
            fetchUserProjects();
        }
    }, [profileUser]);

    const handleSaveProfile = async () => {
        try {
            const res = await api.patch('/users/update-details', {
                fullName: editData.fullName,
                bio: editData.bio,
                techStack: editData.techStack,
                github: editData.github,
                linkedin: editData.linkedin,
                twitter: editData.twitter,
            });
            setProfileUser(res.data.data);
            useAuthStore.getState().setUser(res.data.data); // Update global store too
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleLike = async (postId) => {
        if (!currentUser) {
            toast.error("Sign in to like this post");
            return;
        }

        try {
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const isLiked = post.likes.includes(currentUser._id);
                    return {
                        ...post,
                        likes: isLiked
                            ? post.likes.filter(id => id !== currentUser._id)
                            : [...post.likes, currentUser._id],
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

    const handleToggleFollow = async () => {
        if (isFollowLoading) return;
        try {
            setIsFollowLoading(true);
            const res = await api.post(`/users/follow/${profileUser._id}`);
            const { isFollowing } = res.data.data;

            // Optimistically update local state
            setProfileUser(prev => ({
                ...prev,
                followers: isFollowing
                    ? [...(prev.followers || []), currentUser._id]
                    : (prev.followers || []).filter(id => id !== currentUser._id)
            }));

            toast.success(isFollowing ? "Followed successfully" : "Unfollowed successfully");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsFollowLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingAvatar(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await api.patch('/users/update-avatar', formData);

            // Update local states
            setProfileUser(res.data.data);
            useAuthStore.getState().setUser(res.data.data);
            toast.success("Profile picture updated!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile picture");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        setSavingProject(true);
        try {
            const formData = new FormData();
            formData.append('title', newProject.title);
            formData.append('description', newProject.description);
            formData.append('githubUrl', newProject.githubUrl);
            formData.append('liveUrl', newProject.liveUrl);
            if (newProject.images && newProject.images.length > 0) {
                newProject.images.forEach(img => {
                    formData.append('images', img);
                });
            }

            const res = await api.post('/projects', formData);

            setProjects([res.data.data, ...projects]);
            setIsAddProjectModalOpen(false);
            setNewProject({ title: '', description: '', githubUrl: '', liveUrl: '', images: [] });
            toast.success("Project added successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add project");
        } finally {
            setSavingProject(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/projects/${projectId}`);
            setProjects(projects.filter(p => p._id !== projectId));
            toast.success("Project deleted");
        } catch (error) {
            toast.error("Failed to delete project");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profileUser) {
        return <div className="text-center py-20 text-slate-500 text-xl font-semibold">User not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-0">
            {/* Ambient Background Glows */}
            <div className="fixed top-20 left-10 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob pointer-events-none -z-10"></div>
            <div className="fixed top-40 right-10 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>

            {/* Profile Card */}
            <div className="glass-card rounded-[24px] p-8 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>

                {/* Top Section */}
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
                    {/* Profile Picture */}
                    <div className="relative w-[120px] h-[120px] shrink-0 group">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-secondary blur-md opacity-60 animate-[spin_5s_linear_infinite]"></div>
                        <img
                            src={profileUser.avatar || "https://i.pravatar.cc/250?u=dev"}
                            alt={profileUser.fullName}
                            className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-xl z-10 bg-white"
                        />
                        {isOwnProfile && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                                    className={`absolute inset-0 z-20 m-[4px] bg-slate-900/50 rounded-full flex items-center justify-center cursor-pointer transition-opacity duration-300 border border-transparent hover:border-white/30 backdrop-blur-[2px] ${isUploadingAvatar ? 'opacity-100 cursor-not-allowed' : 'opacity-0 hover:opacity-100'}`}
                                >
                                    {isUploadingAvatar ? (
                                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <FiEdit2 className="text-white w-6 h-6 mb-1 drop-shadow-md" />
                                            <span className="text-white text-[11px] font-bold tracking-wider uppercase drop-shadow-md">Upload</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">{profileUser.fullName}</h1>
                        <p className="text-primary font-semibold text-lg mb-3">@{profileUser.username}</p>
                        <p className="text-slate-500 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                            {profileUser.bio || 'Frontend Engineer | Open Source Enthusiast | Building awesome web experiences 🚀'}
                        </p>

                        {isOwnProfile ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-4 bg-indigo-50 text-primary border border-indigo-100 hover:bg-primary hover:text-white px-5 py-2 rounded-full font-semibold transition-all duration-300 flex items-center justify-center md:justify-start gap-2 text-sm shadow-sm hover:shadow-primary/30 mx-auto md:mx-0"
                            >
                                <FiEdit2 className="w-4 h-4" /> Edit Profile
                            </button>
                        ) : currentUser && (
                            <button
                                onClick={handleToggleFollow}
                                disabled={isFollowLoading}
                                className={`mt-4 px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center justify-center md:justify-start gap-2 text-sm mx-auto md:mx-0 ${profileUser.followers?.includes(currentUser?._id)
                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                    : 'btn-primary shadow-sm hover:shadow-primary/30'
                                    } ${isFollowLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isFollowLoading ? 'Wait...' : profileUser.followers?.includes(currentUser?._id) ? 'Unfollow' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-8 md:gap-12 py-6 border-y border-slate-100 mb-8">
                    <div className="text-center transition-transform hover:-translate-y-1">
                        <div className="text-2xl font-bold text-slate-800">{profileUser.followers?.length || 0}</div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Followers</div>
                    </div>
                    <div className="text-center transition-transform hover:-translate-y-1">
                        <div className="text-2xl font-bold text-slate-800">{profileUser.following?.length || 0}</div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Following</div>
                    </div>
                    <div className="text-center transition-transform hover:-translate-y-1">
                        <div className="text-2xl font-bold text-slate-800">{projects.length || 0}</div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Projects</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Skills */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2.5">
                            {(profileUser.techStack && profileUser.techStack.length > 0) ? profileUser.techStack.map((skill, index) => (
                                <span key={index} className="bg-slate-50 border border-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-sm font-semibold hover:border-accent hover:text-accent hover:-translate-y-0.5 hover:shadow-sm hover:shadow-accent/20 transition-all cursor-default">
                                    {skill}
                                </span>
                            )) : (
                                <span className="text-slate-400 text-sm italic">No tech stack added yet</span>
                            )}
                        </div>
                    </div>

                    {/* Socials */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Connect</h3>
                        <div className="flex gap-3">
                            {profileUser.github && (
                                <a href={profileUser.github.startsWith('http') ? profileUser.github : `https://${profileUser.github}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-600 border border-slate-100 hover:bg-[#333] hover:text-white hover:border-transparent hover:-translate-y-1 transition-all shadow-sm">
                                    <FiGithub className="w-5 h-5" />
                                </a>
                            )}
                            {profileUser.linkedin && (
                                <a href={profileUser.linkedin.startsWith('http') ? profileUser.linkedin : `https://${profileUser.linkedin}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-600 border border-slate-100 hover:bg-[#0077b5] hover:text-white hover:border-transparent hover:-translate-y-1 transition-all shadow-sm">
                                    <FiLinkedin className="w-5 h-5" />
                                </a>
                            )}
                            {profileUser.twitter && (
                                <a href={profileUser.twitter.startsWith('http') ? profileUser.twitter : `https://${profileUser.twitter}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-600 border border-slate-100 hover:bg-[#1da1f2] hover:text-white hover:border-transparent hover:-translate-y-1 transition-all shadow-sm">
                                    <FiTwitter className="w-5 h-5" />
                                </a>
                            )}
                            {(!profileUser.github && !profileUser.linkedin && !profileUser.twitter) && (
                                <span className="text-slate-400 text-sm italic">No social links added</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="mb-6 flex gap-8 border-b border-slate-200">
                {['posts', 'projects'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-2 font-bold text-sm capitalize transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {
                activeTab === 'posts' ? (
                    <div className="space-y-6 mb-12">
                        {postsLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4 glass-card rounded-[24px]">
                                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin shadow-lg"></div>
                                <p className="text-slate-500 font-medium animate-pulse">Loading posts...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="glass-card rounded-[24px] p-12 text-center text-slate-500 mb-12 border-dashed border-slate-200">
                                <FiMessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
                                <p className="font-medium text-lg">{profileUser.fullName.split(' ')[0]} hasn't posted anything yet.</p>
                            </div>
                        ) : (
                            posts.map((post, index) => (
                                <article
                                    key={post._id}
                                    className={`glass-card rounded-3xl p-6 sm:p-7 animate-fade-in-up stagger-${index > 3 ? 1 : index + 1}`}
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
                                                <h4 className="font-bold text-[15px] text-slate-800 tracking-tight">
                                                    {post.author.fullName}
                                                </h4>
                                                <div className="text-[13px] font-medium text-slate-500 mt-0.5 tracking-wide">
                                                    @{post.author.username} • {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </Link>

                                        <button className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-full transition-colors opacity-0 group-hover:opacity-100 md:opacity-100">
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
                                            {post.images.slice(0, post.images.length > 4 ? 4 : post.images.length).map((img, idx) => (
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
                                            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${currentUser && post.likes.includes(currentUser._id)
                                                ? 'text-accent bg-accent/5 shadow-inner border border-accent/10'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                                }`}
                                        >
                                            <FiHeart className={`w-5 h-5 transition-transform duration-300 ${post.justLiked ? 'scale-[1.3] fill-current text-accent' : ''} ${currentUser && post.likes.includes(currentUser._id) ? 'fill-current' : 'group-hover:scale-110'}`} />
                                            <span>{post.likes.length > 0 ? post.likes.length : 'Like'}</span>
                                        </button>

                                        <button className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-300 group">
                                            <FiMessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span>Comment</span>
                                        </button>

                                        <button className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-300 group">
                                            <FiShare2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                ) : activeTab === 'projects' ? (
                    <div className="space-y-6 mb-12 animate-fade-in-up">
                        {isOwnProfile && (
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setIsAddProjectModalOpen(true)} className="btn-primary py-2 px-5 text-sm shadow-sm rounded-xl">
                                    + Add Project
                                </button>
                            </div>
                        )}

                        {projectsLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="glass-card rounded-[24px] p-12 text-center text-slate-500 mb-12 border-dashed border-slate-200">
                                <FiLayers className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
                                <p className="font-medium text-lg">{profileUser.fullName.split(' ')[0]} hasn't added any projects yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.map((project, index) => (
                                    <div key={project._id} className={`glass-card rounded-[20px] overflow-hidden flex flex-col group stagger-${index > 3 ? 1 : index + 1} border-slate-200/60`}>
                                        {project.images && project.images.length > 0 ? (
                                            <div
                                                className="h-48 w-full overflow-hidden relative border-b border-slate-100 bg-slate-100 cursor-zoom-in"
                                                onClick={() => {
                                                    setSelectedProjectForGallery(project);
                                                    setActiveImageIndex(0);
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors z-10"></div>
                                                <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                {project.images.length > 1 && (
                                                    <div className="absolute bottom-3 right-3 z-20 bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
                                                        <FiLayers className="w-2.5 h-2.5" /> +{project.images.length - 1} more
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-4 bg-gradient-to-r from-primary/20 to-accent/20"></div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col pt-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-[17px] font-bold text-slate-800 leading-tight">{project.title}</h3>
                                                {isOwnProfile && (
                                                    <button onClick={() => handleDeleteProject(project._id)} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 -max-mt-1.5 bg-slate-50 hover:bg-red-50 rounded-full">
                                                        <FiX className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-slate-600 text-[14px] leading-relaxed mb-6 flex-1 line-clamp-3">{project.description}</p>

                                            <div className="flex gap-2.5 mt-auto">
                                                {project.githubUrl && (
                                                    <a href={project.githubUrl.startsWith('http') ? project.githubUrl : `https://${project.githubUrl}`} target="_blank" rel="noopener noreferrer" className="flex-1 btn-outline py-2 px-0 text-xs flex items-center justify-center gap-1.5 font-semibold">
                                                        <FiGithub className="w-3.5 h-3.5" /> Source
                                                    </a>
                                                )}
                                                {project.liveUrl && (
                                                    <a href={project.liveUrl.startsWith('http') ? project.liveUrl : `https://${project.liveUrl}`} target="_blank" rel="noopener noreferrer" className="flex-1 btn-primary py-2 px-0 text-xs flex items-center justify-center gap-1.5 font-semibold shadow-sm">
                                                        <FiGlobe className="w-3.5 h-3.5" /> Live Demo
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="glass-card rounded-[24px] p-12 text-center text-slate-400 mb-12 border-dashed">
                        <FiLayers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium text-lg">Select a tab to view {profileUser.fullName.split(' ')[0]}'s content.</p>
                        <p className="text-sm mt-2">More features coming soon in DevConnect v2.</p>
                    </div>
                )
            }


            {/* Edit Profile Modal */}
            {
                isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Edit Profile</h3>
                                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1"><FiX className="w-6 h-6" /></button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={editData.fullName}
                                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Bio</label>
                                    <textarea
                                        rows="3"
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Tech Stack (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. React.js, Node.js, MongoDB"
                                        value={editData.techStack}
                                        onChange={(e) => setEditData({ ...editData, techStack: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium mb-3"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">GitHub URL</label>
                                        <input type="text" placeholder="https://github.com/..." value={editData.github} onChange={(e) => setEditData({ ...editData, github: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-xs font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">LinkedIn URL</label>
                                        <input type="text" placeholder="https://linkedin.com/..." value={editData.linkedin} onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-xs font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">Twitter URL</label>
                                        <input type="text" placeholder="https://twitter.com/..." value={editData.twitter} onChange={(e) => setEditData({ ...editData, twitter: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-xs font-medium" />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveProfile}
                                    className="w-full btn-primary py-3.5 mt-2 text-base shadow-lg shadow-primary/30"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Project Modal */}
            {
                isAddProjectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Add New Project</h3>
                                <button onClick={() => setIsAddProjectModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1"><FiX className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleAddProject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Project Title*</label>
                                    <input required type="text" placeholder="e.g. E-Commerce Platform" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Description*</label>
                                    <textarea required rows="3" placeholder="Describe your project..." value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">GitHub URL</label>
                                        <input type="text" placeholder="https://github.com/..." value={newProject.githubUrl} onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Live URL</label>
                                        <input type="text" placeholder="https://..." value={newProject.liveUrl} onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Project Images (Up to 5)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const newFiles = Array.from(e.target.files);
                                            const totalFiles = [...newProject.images, ...newFiles];
                                            if (totalFiles.length > 5) {
                                                toast.error("You can only upload up to 5 images");
                                                setNewProject({ ...newProject, images: totalFiles.slice(0, 5) });
                                            } else {
                                                setNewProject({ ...newProject, images: totalFiles });
                                            }
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                    />
                                    {newProject.images && newProject.images.length > 0 && (
                                        <div className="mt-3 grid grid-cols-5 gap-2">
                                            {newProject.images.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group/img">
                                                    <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                                                    {idx === 0 && <div className="absolute top-0 left-0 bg-primary/80 text-white text-[8px] px-1 rounded-br-md font-bold">COVER</div>}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const filtered = newProject.images.filter((_, i) => i !== idx);
                                                            setNewProject({ ...newProject, images: filtered });
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                    >
                                                        <FiX className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={savingProject} className="w-full btn-primary py-3.5 mt-4 text-base shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {savingProject ? 'Saving...' : 'Publish Project'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Reusable Image Gallery Modal */}
            {galleryData && (
                <ImageGallery
                    images={galleryData.images}
                    title={galleryData.title}
                    onClose={() => setGalleryData(null)}
                />
            )}
        </div >
    );
};

export default Profile;
