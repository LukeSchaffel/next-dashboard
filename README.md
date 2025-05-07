# Next.js Event Management Dashboard

A modern, full-featured event management system built with Next.js, Mantine UI, and Prisma. This application provides a comprehensive solution for managing events, locations, ticket sales, and seating arrangements.

## Features

- 🔐 **Authentication & Authorization**

  - Secure authentication using Clerk
  - Role-based access control (Admin, Employee)
  - Workspace-based multi-tenancy

- 📅 **Event Management**

  - Create and manage events
  - Support for event series
  - Calendar integration with FullCalendar
  - Custom event layouts and seating arrangements

- 🎟️ **Ticket System**

  - Multiple ticket types with different pricing
  - Seat selection and management
  - QR code generation for tickets
  - Ticket status tracking (Pending, Confirmed, Cancelled, Refunded)

- 📍 **Location Management**

  - Create and manage venues
  - Custom layout templates for venues
  - Contact information and social media links
  - Seating arrangement templates

- 🎨 **Modern UI/UX**
  - Built with Mantine UI components
  - Responsive design
  - Interactive charts and data visualization
  - Rich text editing capabilities

## Tech Stack

- **Framework**: Next.js 15.2.3
- **UI Library**: Mantine UI v7
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **State Management**: Zustand
- **Calendar**: FullCalendar
- **Charts**: Recharts
- **PDF Generation**: @react-pdf/renderer
- **QR Code**: react-qr-code
- **Rich Text Editor**: TipTap

## Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL database
- Clerk account for authentication
- Yarn package manager

## Getting Started

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd next-dashboard
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Initialize the database:

   ```bash
   yarn prisma generate
   yarn prisma migrate dev
   ```

5. Run the development server:
   ```bash
   yarn dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # Shared UI components
│   ├── dashboard/         # Admin dashboard application
│   ├── events/           # Public event pages
│   ├── locations/        # Public venue pages
│   └── purchase/         # Ticket purchase flow
├── lib/                   # Core utilities and configurations
├── prisma/               # Database schema and models
├── public/              # Static assets
├── stores/             # State management
└── middleware.ts        # Authentication middleware
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn prisma generate` - Generate Prisma client
- `yarn prisma migrate dev` - Run database migrations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
