'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Crown, Check, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  id: string;
  username: string;
  isSubscribed: boolean;
  subscriptionType?: string;
  subscriptionExpires?: string;
}

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const SUBSCRIPTION_PLANS = {
    premium: {
      name: t('subscription.premium'),
      price: 9.99,
      features: [
        t('subscription.features.hd'),
        t('subscription.features.adfree'),
        t('subscription.features.downloads'),
        t('subscription.features.devices2'),
        t('subscription.features.support'),
      ],
    },
    vip: {
      name: t('subscription.vip'),
      price: 19.99,
      features: [
        t('subscription.features.4k'),
        t('subscription.features.adfree'),
        t('subscription.features.downloads'),
        t('subscription.features.devices5'),
        t('subscription.features.exclusive'),
        t('subscription.features.earlyAccess'),
        t('subscription.features.support'),
        t('subscription.features.badge'),
      ],
    },
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json() as { user: User };
        setUser(data.user);
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    } catch (error) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType: string) => {
    setSubscribing(planType);
    setError('');

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      if (response.ok) {
        await fetchUser(); // Refresh user data
        alert('Subscription successful! Welcome to ' + planType + '!');
      } else {
        const data = await response.json() as { error?: string };
        setError(data.error || 'Subscription failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar user={user} />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Unlock premium content and enhanced features
          </p>
          
          {user?.isSubscribed && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/50 rounded-lg inline-block">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-green-600" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  You are currently subscribed to {user.subscriptionType}
                </span>
              </div>
              {user.subscriptionExpires && (
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  Expires: {new Date(user.subscriptionExpires).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Free</span>
                <span className="text-lg font-normal text-gray-500">$0/month</span>
              </CardTitle>
              <CardDescription>
                Perfect for casual viewing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>SD streaming up to 480p</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Basic content library</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Watch on 1 device</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Community support</span>
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={!user?.isSubscribed}
              >
                {!user?.isSubscribed ? 'Current Plan' : 'Downgrade to Free'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Premium and VIP Plans */}
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <Card 
              key={key}
              className={`border-2 relative ${
                key === 'vip' 
                  ? 'border-purple-500 shadow-purple-100 dark:shadow-purple-900/50' 
                  : 'border-blue-500 shadow-blue-100 dark:shadow-blue-900/50'
              }`}
            >
              {key === 'vip' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className={`w-5 h-5 ${key === 'vip' ? 'text-purple-500' : 'text-blue-500'}`} />
                  <span>{plan.name}</span>
                  <span className="text-lg font-normal text-gray-500">
                    ${plan.price}/month
                  </span>
                </CardTitle>
                <CardDescription>
                  {key === 'premium' ? 'Enhanced viewing experience' : 'Ultimate premium experience'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    key === 'vip' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={() => handleSubscribe(key)}
                  disabled={subscribing === key || user?.subscriptionType === key}
                >
                  {subscribing === key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {user?.subscriptionType === key 
                    ? 'Current Plan' 
                    : `Subscribe to ${plan.name}`
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! You can upgrade or downgrade your subscription at any time. 
                  Changes will be reflected in your next billing cycle.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  We accept all major credit cards, PayPal, and digital wallets. 
                  All payments are processed securely.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Absolutely! You can cancel your subscription at any time. 
                  You'll continue to have access until the end of your current billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of users enjoying premium content on MoeTV
          </p>
          {!user?.isSubscribed && (
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => handleSubscribe('premium')}
            >
              Start Free Trial
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export const runtime = "edge";
