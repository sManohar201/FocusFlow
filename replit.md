# Overview

This is a cross-platform, web-based Deep Work Tracker application built to help users manage and track their focused work sessions. The application features a Pomodoro-style timer with customizable session modes, productivity analytics with GitHub-style heatmaps, task management, and distraction logging to optimize focus and productivity.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses React with TypeScript as the primary frontend framework, styled with Tailwind CSS and shadcn/ui components. The frontend follows a modern component-based architecture with:

- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing  
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives
- **Theme System**: Custom dark/light mode theme provider with CSS variables
- **Build System**: Vite for fast development and optimized production builds
- **Audio System**: Web Audio API integration for session completion notifications

## Backend Architecture
The backend is built with Node.js and Express, implementing a RESTful API architecture:

- **Database Layer**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Authentication**: Session-based authentication with bcrypt password hashing
- **Data Storage**: PostgreSQL database with structured schema for users, sessions, tasks, and distractions
- **API Design**: RESTful endpoints for authentication, sessions, tasks, users, distractions, and analytics

## Database Schema Design
The application uses a relational database schema with four main entities:

- **Users**: Stores user credentials (email, password hash), profile information (first/last name), and settings
- **Sessions**: Tracks work/break sessions with duration, completion status, and associated tasks
- **Tasks**: Manages task lifecycle with status tracking, priority levels, and session estimation
- **Distractions**: Logs interruptions during sessions for productivity analysis

## Timer System
The core timer functionality implements multiple session modes:

- **Preset Modes**: 30-minute and 50-minute session options with 4-session cycles
- **Custom Duration**: User-configurable session lengths
- **Session Types**: Work sessions and break periods with different audio cues
- **Progress Tracking**: Real-time session progress with circular progress indicators
- **Audio Feedback**: Bell chimes and beeps for session completion notifications

## Analytics and Visualization
The productivity tracking system includes:

- **Heatmap Visualization**: GitHub-style contribution graph showing daily session counts with color intensity
- **Statistical Analysis**: Daily, weekly, monthly productivity metrics including completion rates
- **Session Tracking**: Comprehensive logging of all work sessions with timestamps and completion status
- **Distraction Analytics**: Tracking and analysis of interruptions during focus sessions

# External Dependencies

- **Database**: PostgreSQL with Neon Database serverless driver
- **UI Framework**: Radix UI primitives for accessible component foundation
- **CSS Framework**: Tailwind CSS for utility-first styling
- **Build Tools**: Vite for development server and production builds
- **Form Handling**: React Hook Form with Zod validation
- **Date Management**: date-fns for date formatting and manipulation
- **Password Security**: bcryptjs for password hashing
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session store