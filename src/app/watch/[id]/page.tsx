'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import VideoCard from '@/components/VideoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Heart, Share2, Download, Eye, Calendar, Tag, User, Crown, Lock } from 'lucide-react';
import { formatViews } from '@/lib/utils';

interface Video {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  likes: number;
  category?: string;
  tags?: string[];
  isPremium?: boolean;
  createdAt: string;
  uploader?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

interface User {
  id: string;
  username: string;
  isSubscribed: boolean;
  subscriptionType?: string;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  
  const [video, setVideo] = useState<Video | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
      fetchUser();
    }
  }, [videoId]);

  useEffect(() => {
    if (video) {
      fetchRelatedVideos();
    }
  }, [video]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json() as { user: User };
        setUser(data.user);
      }
    } catch (error) {
      // User not logged in
      console.log('No user session found');
    }
  };

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/${videoId}`);
      if (response.ok) {
        const data = await response.json() as { video: Video };
        setVideo(data.video);
      } else if (response.status === 404) {
        setError('Video not found');
      } else {
        setError('Failed to load video');
      }
    } catch (error) {
      setError('Failed to load video');
      console.error('Fetch video error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const params = new URLSearchParams();
      if (video?.category) {
        params.append('category', video.category);
      }
      params.append('limit', '8');
      
      const response = await fetch(`/api/videos?${params}`);
      if (response.ok) {
        const data = await response.json() as { videos: Video[] };
        // Filter out current video
        const filtered = data.videos.filter((v: Video) => v.id !== videoId);
        setRelatedVideos(filtered);
      }
    } catch (error) {
      console.error('Fetch related videos error:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // TODO: Implement like functionality
    setLiked(!liked);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video?.title,
        text: video?.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar user={user} />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading video...</span>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Video not found'}
            </h1>
            <Button onClick={() => router.push('/')}>
              Go back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user can access premium content
  const canAccessPremium = !video.isPremium || (user?.isSubscribed);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative">
              {canAccessPremium ? (
                <VideoPlayer
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  title={video.title}
                  className="w-full aspect-video"
                />
              ) : (
                <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-50"
                    />
                  )}
                  <div className="relative text-center p-8">
                    <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Premium Content
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      This video requires a premium subscription to watch
                    </p>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => router.push('/subscription')}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {video.title}
                    {video.isPremium && (
                      <Crown className="w-5 h-5 text-yellow-500 inline ml-2" />
                    )}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {formatViews(video.views)}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                    {video.category && (
                      <span className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {video.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={liked ? 'text-red-600 border-red-600' : ''}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                    {video.likes + (liked ? 1 : 0)}
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  {canAccessPremium && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>

              {/* Uploader Info */}
              {video.uploader && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      {video.uploader.avatar ? (
                        <img
                          src={video.uploader.avatar}
                          alt={video.uploader.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {video.uploader.username}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Content Creator
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Subscribe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {video.description && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {video.description}
                    </p>
                    
                    {video.tags && video.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {video.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Related Videos
            </h2>
            
            {relatedVideos.length > 0 ? (
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <div key={relatedVideo.id} className="cursor-pointer">
                    <VideoCard
                      id={relatedVideo.id}
                      title={relatedVideo.title}
                      description={relatedVideo.description}
                      thumbnailUrl={relatedVideo.thumbnailUrl}
                      duration={relatedVideo.duration}
                      views={relatedVideo.views}
                      likes={relatedVideo.likes}
                      category={relatedVideo.category}
                      isPremium={relatedVideo.isPremium}
                      uploader={relatedVideo.uploader}
                      createdAt={new Date(relatedVideo.createdAt)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No related videos found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}