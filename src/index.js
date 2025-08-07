import { createRequestHandler } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@cloudflare/next-on-pages';

// This is a basic Cloudflare Worker entry point for Next.js
// The actual Next.js app will be built and served through Cloudflare Pages

export default {
  async fetch(request, env, ctx) {
    // For now, return a simple response indicating the app is running
    return new Response('MoeTV is running on Cloudflare Workers', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  },
};
