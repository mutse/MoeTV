'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Eye, Heart, Clock, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDuration, formatViews } from '@/lib/utils';

interface VideoCardProps {
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
  createdAt: Date;
}

export default function VideoCard({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  views,
  likes,
  category,
  isPremium,
  uploader,
  createdAt,
}: VideoCardProps) {
  const timeAgo = React.useMemo(() => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(createdAt).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }, [createdAt]);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <Link href={`/watch/${id}`}>
          <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Play className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>

            {/* Duration badge */}
            {duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatDuration(duration)}
              </div>
            )}

            {/* Premium badge */}
            {isPremium && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded flex items-center">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </div>
            )}
          </div>
        </Link>
      </div>

      <CardContent className="p-4">
        <Link href={`/watch/${id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
        </Link>

        {uploader && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            by {uploader.username}
          </p>
        )}

        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {formatViews(views)}
            </span>
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {likes}
            </span>
          </div>
          
          <span className="text-xs">
            {timeAgo}
          </span>
        </div>

        {category && (
          <div className="mt-2">
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
              {category}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}