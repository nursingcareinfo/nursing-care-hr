# NursingCare.pk HR Management System

A comprehensive HR management dashboard for home nursing care businesses. Built with Next.js 14 and Supabase.

## Features

- **Dashboard**: Real-time business overview with stats and alerts
- **Staff Management**: Full CRUD for 1200+ staff with compliance tracking
- **Patient Management**: Patient records with care assignments
- **Scheduling**: Shift management with calendar view
- **Payroll**: Automated payroll processing
- **Reports**: Business analytics and insights
- **WhatsApp Integration**: Automated notifications

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL in `supabase/schema.sql`
3. Get your URL and anon key
4. Add them to environment variables

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed anywhere that supports Next.js:
- Vercel
- Netlify
- Railway
- Render

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx     # Dashboard
│   ├── staff/       # Staff management
│   ├── patients/    # Patient management
│   ├── scheduling/ # Scheduling
│   ├── payroll/    # Payroll
│   ├── reports/    # Reports
│   └── settings/   # Settings
├── components/      # React components
│   └── Sidebar.tsx
└── lib/           # Utilities
    ├── supabase.ts
    └── types.ts
```

## License

Internal use only - NursingCare.pk
