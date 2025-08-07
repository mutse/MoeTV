'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, LogOut, Crown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

interface NavbarProps {
  user?: {
    id: string;
    username: string;
    isSubscribed: boolean;
    subscriptionType?: string | null;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">MoeTV</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="flex w-full">
              <Input
                type="text"
                placeholder={t('navbar.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0"
              />
              <Button type="submit" variant="outline" className="rounded-l-none px-3">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageToggle />
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                  {user.isSubscribed && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                
                <Link href="/subscription">
                  <Button variant="outline" size="sm">
                    {user.isSubscribed ? t('navbar.manage') : t('navbar.subscribe')}
                  </Button>
                </Link>
                
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">{t('navbar.login')}</Button>
                </Link>
                <Link href="/register">
                  <Button>{t('navbar.signup')}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="flex">
            <Input
              type="text"
              placeholder={t('navbar.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none border-r-0"
            />
            <Button type="submit" variant="outline" className="rounded-l-none px-3">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="px-4 pb-4">
              <LanguageToggle />
            </div>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 px-4">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                  {user.isSubscribed && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                
                <div className="px-4">
                  <Link href="/subscription" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      {user.isSubscribed ? t('navbar.manageSubscription') : t('navbar.subscribe')}
                    </Button>
                  </Link>
                </div>
                
                <div className="px-4">
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('navbar.logout')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <Link href="/login" className="block w-full">
                  <Button variant="ghost" className="w-full justify-start">{t('navbar.login')}</Button>
                </Link>
                <Link href="/register" className="block w-full">
                  <Button className="w-full">{t('navbar.signup')}</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}