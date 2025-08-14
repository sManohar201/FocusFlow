
# Project Overview

This is a full-stack TypeScript application called **FocusFlow**, a web-based "Deep Work Tracker". The goal of the application is to help users manage and track their focused work sessions.

**Key Technologies:**

*   **Frontend:**
    *   React
    *   TypeScript
    *   Vite
    *   Tailwind CSS
    *   shadcn/ui
*   **Backend:**
    *   Node.js
    *   Express
    *   TypeScript
    *   Drizzle ORM
*   **Database:**
    *   PostgreSQL

**Architecture:**

The application follows a modern web architecture with a separate frontend and backend.

*   The **frontend** is a single-page application (SPA) built with React and Vite. It uses `wouter` for routing and `@tanstack/react-query` for state management.
*   The **backend** is a RESTful API built with Express. It uses Drizzle ORM to interact with the PostgreSQL database.
*   **Authentication** is session-based, using `passport` and `express-session`.
*   The **database schema** is defined in the `shared/schema.ts` file and managed using `drizzle-kit`.

# Building and Running

The following scripts are available in `package.json`:

*   `npm run dev`: Starts the development server with hot-reloading.
*   `npm run build`: Builds the frontend and backend for production.
*   `npm run start`: Starts the production server.
*   `npm run check`: Runs the TypeScript compiler to check for type errors.
*   `npm run db:push`: Pushes changes from the Drizzle schema to the database.

# Development Conventions

*   **Code Style:** The project uses Prettier for code formatting (inferred from the presence of `.prettierrc`).
*   **Testing:** There are no explicit testing frameworks configured in the `package.json`.
*   **Commits:** No explicit commit message conventions are enforced.
