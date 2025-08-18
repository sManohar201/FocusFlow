# Project Overview

This is a Next.js project bootstrapped with `create-next-app`. It is a comprehensive web-based Pomodoro deep work tracking application that combines customizable timer intervals with gamified productivity tracking and task management, accessible across laptop, phone, and iPad.

## Core Features:

*   Customizable Pomodoro timer with distraction logging and chime notifications at session/break end
*   GitHub-style heatmap displaying deep work statistics by day/week/month with motivational dashboard showing session counts
*   Kanban-style task management with celebration animations on completion and deep work session allocation per task
*   Gmail-based user authentication for signup and login

## Visual References:
*   Inspired by GitHub's contribution heatmap interface and Notion's task management boards, known for their clean data visualization and modern task organization.

## Style Guide:

*   **Colors:** Primary #FF6B6B (energetic coral), Secondary #4ECDC4 (calming teal), Success #51CF66 (GitHub green), Background #FAFAFA (soft white), Text #2D3748 (charcoal), Accent #667EEA (focus purple)
*   **Design:** Inter/Poppins fonts, card-based layout with rounded corners, responsive grid system, smooth animations, mobile-first approach with touch-friendly controls, 16px base spacing, modern glassmorphism effects for timer interface

## Final MVP Plan (Logic-Focused)

1.  **User Authentication (Backend Logic):**
    *   Set up Clerk for Gmail-based authentication.
    *   Create the necessary API routes and backend services to handle user signup and login.

2.  **"Deep Work Session" Data Model:**
    *   Design the database schema for storing "Deep Work Sessions." This will include fields for the task name, session duration, and a distraction count. We'll use Supabase for this.

3.  **"Deep Work" Timer Logic:**
    *   Implement the core timer logic (start, pause, reset) in a React component.
    *   Create a function to increment the "distraction count" when the user logs a distraction.
    *   Implement the logic for the chime notification at the end of the session.

4.  **Deployment:**
    *   Deploy the application to Vercel.

## Technologies

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/) (inferred from `components.json` and `tailwind.config.js`)
*   **Authentication:** [Clerk](https://clerk.com/)
*   **Database:** [Supabase](https://supabase.com/)
*   **Drag and Drop:** [@dnd-kit](https://dndkit.com/)
*   **Linting:** [ESLint](https://eslint.org/)

## Building and Running

### Development

To run the development server:

```bash
npm run dev
```

This will start the development server with Turbopack. Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production

To build the application for production:

```bash
npm run build
```

To start a production server:

```bash
npm run start
```

## Testing

There are no testing frameworks configured yet.

## Development Conventions

*   The project uses ESLint for linting. Run `npm run lint` to check for linting errors.
*   The project uses the `app` directory for routing.
*   UI components are located in the `components/ui` directory.
*   Utility functions are located in the `lib` directory.
