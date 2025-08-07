# MoeTV - Video Streaming Platform

A modern video streaming platform built with Next.js, Tailwind CSS, and Cloudflare D1 database. Features include user authentication, subscription management, and premium content access.

## Features

- 🎥 **Video Streaming**: Custom video player with full controls
- 👤 **User Authentication**: Registration, login, and session management
- 💳 **Subscription System**: Free, Premium, and VIP tiers
- 🔒 **Premium Content**: Restricted access for subscribed users
- 📱 **Responsive Design**: Works on all devices
- 🌙 **Dark Mode Support**: Built-in light/dark theme switching
- 🔍 **Search & Categories**: Filter videos by category and search
- ❤️ **Social Features**: Like, share, and comment functionality
- 📊 **Analytics**: View counts and engagement tracking

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: Cloudflare D1 (SQLite), Drizzle ORM
- **Authentication**: JWT tokens with secure cookies
- **Deployment**: Cloudflare Pages/Workers

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Cloudflare account (for production)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd moetv-streaming
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and fill in your values:
   - `JWT_SECRET`: Generate a strong random string
   - `DATABASE_URL`: Your Cloudflare D1 database URL
   - Other Cloudflare credentials for production

4. **Set up the database**
   
   For local development, you can use a local SQLite database:
   ```bash
   # Generate database migrations
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see your application.

### Cloudflare D1 Setup

1. **Create a D1 database**
   ```bash
   wrangler d1 create moetv
   ```

2. **Update wrangler.toml** with your database ID

3. **Run migrations**
   ```bash
   wrangler d1 migrations apply moetv-db --local
   ```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── subscription/      # Subscription management
│   ├── watch/[id]/        # Video watch page
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── Navbar.tsx         # Navigation component
│   ├── VideoCard.tsx      # Video thumbnail card
│   └── VideoPlayer.tsx    # Custom video player
├── lib/                   # Utilities and configurations
│   ├── db/                # Database schema and config
│   ├── utils/             # Helper functions
│   └── auth.ts            # Authentication utilities
└── styles/                # Global styles
```

## Key Features Explained

### Authentication System
- JWT-based authentication with secure HTTP-only cookies
- Password hashing with bcrypt
- Session management with automatic token refresh

### Subscription System
- Three tiers: Free, Premium ($9.99/month), VIP ($19.99/month)
- Premium content access control
- Subscription status tracking and expiration

### Video Management
- Video metadata storage (title, description, duration, etc.)
- View count tracking
- Category and tag system
- Premium content flagging

### Database Schema
- Users table with subscription information
- Videos table with metadata and relationships
- Subscriptions table for payment tracking
- Watch history and favorites tracking
- Comments system support

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Videos
- `GET /api/videos` - List videos (with filtering)
- `GET /api/videos/[id]` - Get specific video
- `POST /api/videos` - Upload video (authenticated)

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription

## Deployment

### Cloudflare Pages
1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add environment variables in Cloudflare dashboard

### Environment Variables for Production
- `JWT_SECRET`: Secure random string
- `DATABASE_URL`: Cloudflare D1 connection string
- `NODE_ENV`: "production"

## Development

### Running Tests
```bash
npm run test
```

### Code Quality
```bash
# Run linter
npm run lint

# Type checking
npm run typecheck
```

### Database Management
```bash
# View database in browser
npm run db:studio

# Generate new migration
npm run db:generate

# Apply migrations
npm run db:push
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help with setup, please:
1. Check the documentation above
2. Search existing GitHub issues
3. Create a new issue with detailed information

## Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Advanced video analytics
- [ ] Live streaming support
- [ ] Mobile app development
- [ ] Content management system
- [ ] Advanced search with AI recommendations
- [ ] Social features (followers, playlists)
- [ ] Multi-language support

---

Built with ❤️ using Next.js and Cloudflare D1