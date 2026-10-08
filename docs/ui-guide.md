# HiredLens UI Guide

## 1. Layout Shell & Nav
- **Main Shell**: Built around a primary dashboard layout (`Dashboard.tsx` / `SetupView.tsx`). 
- **Navigation**: Controlled by React Router. The dashboard has a `DashboardSidebar` and `DashboardTopBar`.
- **Tabs**: Features within the dashboard (e.g., ATS Match, Rewrites, Roadmap, Interview) are handled via a local state tab switcher.

## 2. Theme Tokens
- Uses Tailwind CSS with custom CSS variables (shadcn/ui style).
- Backgrounds: `bg-background`, `bg-card`
- Text: `text-foreground`, `text-muted-foreground`
- Accents: `text-blue-400`, `bg-blue-600` (often manually applied as utility classes).

## 3. Shared Components
- Lucide React icons for visual indicators.
- Standard Tailwind-styled buttons, inputs, and cards.
- Toasts for notifications (success/error).

## 4. API Client
- Centralized Axios instance (`apps/web/src/lib/api.ts`).
- Attaches the JWT Bearer token automatically via an interceptor.

## 5. State Handling
- **Global**: Zustand (`useAuthStore`) for user authentication tokens.
- **Local**: React `useState` and `useEffect` for tab switching, loading states (`isGeneratingX`), and storing analysis results.
