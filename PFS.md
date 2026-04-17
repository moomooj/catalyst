# Project Folder Structure

```text
src/
├── app/                  # Routing & Layouts (Next.js App Router)
│   ├── (auth)/           # Route Groups (Authentication pages)
│   ├── dashboard/        # Dashboard Feature Routes
│   └── api/              # Route Handlers (Server-side API Endpoints)
│       ├── auth/
│       └── posts/
│
├── features/             # Domain-Specific Modules (Core Business Logic)
│   ├── auth/             # Authentication Feature
│   │   ├── components/   # UI Components specific to Auth
│   │   ├── hooks/        # Custom hooks for Auth logic
│   │   ├── actions.ts    # Server Actions (Form mutations)
│   │   ├── service.ts    # Data Access Layer (DB/External API)
│   │   ├── schema.ts     # Validation Schemas (Zod)
│   │   └── types.ts      # TypeScript definitions for Auth
│   └── post/             # Post Management Feature
│
├── components/           # Shared UI Components (Design System)
│   ├── ui/               # Atomic Components (Button, Input, etc.)
│   └── common/           # Layout Components (Navbar, Footer, etc.)
│
├── lib/                  # Shared Configurations & Utilities
│   ├── db/               # Database Client (Prisma/Drizzle)
│   ├── auth/             # Auth Configurations (NextAuth/Lucia)
│   └── utils/            # General Helper Functions
│
├── hooks/                # Global/Shared React Hooks
├── types/                # Global TypeScript Definitions
├── constants/            # Application-wide Constants
└── styles/               # Global CSS & Tailwind Configurations
```
