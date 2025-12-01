# bldr - Flagship Schedule Builder

<div align="center">

**A modern, intuitive course schedule builder designed for University of Kansas students**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)

</div>

---

## 📋 Overview

**bldr** is a full-stack web application that simplifies the course registration process for KU students. Instead of juggling multiple tabs and manually checking for time conflicts, students can visually build their schedules with an interactive calendar interface, search for classes in real-time, and save multiple schedule variations.

## ✨ Features

### 🔐 User Authentication
- Secure signup and login with email/password
- Session management with automatic refresh
- Protected routes ensuring data privacy
- Row Level Security (RLS) for database protection

### 🔍 Smart Class Search
- Real-time search across all available courses
- Instant results with department, course code, and title
- Keyboard navigation support (arrow keys + enter)
- Auto-complete dropdown with search results

### 📅 Visual Calendar Editor
- Interactive weekly calendar view (Monday - Friday, 8 AM - 8 PM)
- Color-coded class blocks based on department
- Drag-free visual schedule building
- Tooltips showing detailed class information (instructor, days, class ID)

### 📚 Schedule Management
- Create multiple schedules for different semester scenarios
- Save, rename, and delete schedules
- Sidebar navigation for quick schedule switching
- Real-time schedule updates and persistence

### 📊 Class Details
- View available sections for each course
- Real-time seat availability with color indicators:
  - 🟢 Green: 10+ seats available
  - 🟡 Yellow: Less than 10 seats
  - 🔴 Red: 3 or fewer seats
  - ⚫ Gray: No seats available
- Instructor information and meeting times
- Section component types (Lecture, Lab, Discussion, etc.)

### 🎨 Modern UI/UX
- Clean, dark-themed interface
- Smooth animations powered by Framer Motion
- Responsive design for various screen sizes
- Toast notifications for user feedback

---

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Radix UI Components |
| **State Management** | React Context API, React Hook Form |
| **Animation** | Framer Motion |
| **Authentication** | Supabase Auth |
| **Database** | Supabase (PostgreSQL) |
| **UI Components** | shadcn/ui, Lucide Icons |
| **Form Validation** | Zod |

---

## 🏗️ Architecture

The application follows a modern full-stack architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Login/Signup│  │   Builder   │  │  Schedule Calendar  │  │
│  │    Pages    │  │    Page     │  │     Component       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              React Context Providers                   │  │
│  │  (AuthContext, ScheduleBuilderContext, ActiveSchedule) │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Routes                               │
│         (Class Search, Schedule CRUD Operations)             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Backend                           │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │  Supabase Auth  │  │        PostgreSQL Database        │  │
│  │   (JWT, RLS)    │  │  (Users, Schedules, Classes)     │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (for database and authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/an-siuu-man/EECS-581-Team-29-Project-3.git
   cd EECS-581-Team-29-Project-3/project/bldr
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the `project/bldr` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |

---

## 📁 Project Structure

```
project/bldr/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API route handlers
│   │   ├── builder/           # Main schedule builder page
│   │   ├── signup/            # User registration page
│   │   └── page.tsx           # Login page
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components (shadcn)
│   │   ├── CalendarEditor.tsx # Schedule calendar view
│   │   ├── ClassSearch.tsx    # Class search functionality
│   │   ├── Sidebar.tsx        # Schedule navigation sidebar
│   │   └── Class.tsx          # Class details component
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── ScheduleBuilderContext.tsx
│   │   └── ActiveScheduleContext.tsx
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── package.json
```

---

## 📊 Database Schema

The application uses a PostgreSQL database with tables for:
- Course catalog data
- User-created schedules
- Schedule-class relationships
- User account information

For detailed schema information, see the [ER Diagram](./Initial%20Architecture%20diagrams/er_diagram.png).

---

## 👥 Team Members - Group 29

| Name | Role |
|------|------|
| **Ansuman Sharma** | Team Member |
| **Achinth Ulagapperoli** | Team Member |
| **Jahnvi Maddila** | Team Member |
| **Vamsi Doddapaneni** | Team Member |
| **Taha Khalid** | Team Member |

---

## 📄 Documentation

- [Component Diagram](./Initial%20Architecture%20diagrams/component_diagram.png)
- [Data Flow Diagram](./Initial%20Architecture%20diagrams/data%20flow.png)
- [ER Diagram](./Initial%20Architecture%20diagrams/er_diagram.png)
- [Supabase Auth Overview](./project/bldr/Supabase%20auth%20overview.md)

---


<div align="center">

**Built with ❤️ by Team 29 for KU Students**

</div>

