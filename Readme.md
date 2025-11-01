# Skripsi Peta - Earthquake Risk Mapping System

A web application for earthquake risk mapping and clustering analysis using K-Means algorithm.

## Features

- 🗺️ Interactive map visualization with GeoJSON support
- 📊 K-Means clustering analysis for risk assessment
- 📈 Admin dashboard for data management
- 🔐 Secure authentication with Supabase
- 📁 CSV data import/export functionality
- 🎨 Modern UI with Tailwind CSS

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials (see [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md))

### 3. Run Development Server

```bash
npm run dev
```

## Authentication Setup

See [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md) for detailed instructions on setting up Supabase authentication.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ProtectedRoute/  # Auth guard component
│   ├── Navigation/      # Main navigation
│   └── ui/              # UI primitives (buttons, etc.)
├── pages/               # Application pages
│   ├── Admin/           # Admin dashboard (protected)
│   ├── Auth/Login/      # Login page
│   ├── Map/             # Map visualization
│   ├── Home/            # Landing page
│   └── About/           # About page
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configs
│   └── supabaseClient.ts  # Supabase client setup
└── types/               # TypeScript type definitions
```

## Available Routes

- `/` - Home page
- `/map` - Interactive map with clustering visualization
- `/admin` - Admin dashboard (requires authentication)
- `/about` - About page
- `/login` - Login page

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Leaflet** - Map visualization
- **Supabase** - Authentication & database
- **Lucide React** - Icons

## License

MIT
