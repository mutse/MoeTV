'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import VideoCard from '@/components/VideoCard';
import LanguageToggle from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Crown, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const categories = ['all', 'entertainment', 'education', 'gaming', 'music', 'technology', 'lifestyle'];

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  likes: number;
  category?: string;
  isPremium?: boolean;
  uploader?: {
    username: string;
  };
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  isSubscribed: boolean;
  subscriptionType?: string | null;
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    fetchUser();
    fetchVideos();
  }, [selectedCategory]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json() as { user: User };
        setUser(data.user);
      }
    } catch (error) {
      // User not logged in or error occurred, continue without user
      console.log('No user session found');
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/videos?${params}`);
      if (response.ok) {
        const data = await response.json() as { videos: Video[] };
        setVideos(data.videos);
      } else {
        setError('Failed to load videos');
      }
    } catch (error) {
      setError('Failed to load videos');
      console.error('Fetch videos error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('home.welcome')}
            </h1>
            <p className="text-lg mb-6 opacity-90">
              {t('home.subtitle')}
              {!user?.isSubscribed && ` ${t('home.upgradeMessage')}`}
            </p>
            {!user?.isSubscribed && (
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => window.location.href = '/subscription'}
              >
                <Crown className="w-5 h-5 mr-2" />
{t('home.getPremium')}
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">{t('common.loading')}</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchVideos}>{t('common.retry')}</Button>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{t('home.noVideos')}</p>
            <Button onClick={fetchVideos}>{t('common.retry')}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                description={video.description}
                thumbnailUrl={video.thumbnailUrl}
                duration={video.duration}
                views={video.views}
                likes={video.likes}
                category={video.category}
                isPremium={video.isPremium}
                uploader={video.uploader}
                createdAt={new Date(video.createdAt)}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {videos.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              {t('home.loadMore')}
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="text-xl font-bold">MoeTV</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('footer.description')}
              </p>
              <div className="mb-4">
                <LanguageToggle />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('footer.platform')}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">{t('footer.browse')}</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">{t('footer.categories')}</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">{t('footer.premium')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('footer.support')}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">{t('footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">{t('footer.contact')}</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">{t('footer.terms')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('footer.account')}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="/login" className="hover:text-gray-900 dark:hover:text-white">{t('footer.login')}</a></li>
                <li><a href="/register" className="hover:text-gray-900 dark:hover:text-white">{t('footer.signUp')}</a></li>
                <li><a href="/subscription" className="hover:text-gray-900 dark:hover:text-white">{t('footer.subscription')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}