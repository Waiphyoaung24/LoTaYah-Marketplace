# LoTaYah Marketplace - Frontend

This is the Next.js frontend application for LoTaYah Marketplace, migrated from the original Vite/React application.

## Features

- **Multi-language Support**: English and Myanmar (Burmese)
- **Multi-currency Support**: MMK, THB, GBP
- **Seller Dashboard**: Manage inventory with AI-powered product descriptions and image generation
- **Storefront**: Browse products by store with filtering and search
- **Community Feed**: Social feed and merchant trust scores
- **Shopping Cart**: Add items to cart and checkout
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Add your Gemini API key to `.env.local`:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── browse/            # Browse products page
│   ├── seller/            # Seller dashboard page
│   ├── community/         # Community feed page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home/landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Auth.tsx          # Authentication component
│   ├── Button.tsx        # Reusable button component
│   ├── CartDrawer.tsx    # Shopping cart drawer
│   ├── Community.tsx     # Community feed component
│   ├── Navigation.tsx    # Main navigation
│   ├── ProductCard.tsx   # Product card component
│   ├── SellerDashboard.tsx # Seller dashboard
│   └── Storefront.tsx   # Storefront/browse component
├── contexts/             # React Context providers
│   └── AppContext.tsx   # Main app state context
├── lib/                 # Utilities and types
│   ├── types.ts         # TypeScript type definitions
│   ├── translations.ts  # Translation strings
│   └── services/        # API services
│       └── geminiService.ts # Gemini AI service
└── public/              # Static assets
```

## Key Technologies

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Google Gemini AI**: Product description and image generation

## Migration Notes

This frontend was migrated from a Vite/React application. Key changes:

1. **Routing**: Converted from state-based routing to Next.js App Router
2. **State Management**: Centralized state in React Context instead of prop drilling
3. **Components**: All components marked with `'use client'` for client-side interactivity
4. **Environment Variables**: Uses `NEXT_PUBLIC_` prefix for client-side env vars
5. **Image Optimization**: Ready for Next.js Image component (currently using regular img tags)

## Environment Variables

- `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key for AI features

## License

See the main project LICENSE file.
