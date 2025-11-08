# Music Management System

A user-specific music management website built with Next.js, React 19, TypeScript, Redux Toolkit, and Material-UI v7.

## Features

- **User Authentication**: Sign up and login pages with proper validation
- **Song Management**: Add, edit, delete, and play songs
- **Search & Filters**: Search by title/singer, filter by singer, alphabet, and year range
- **User-Specific**: Each user can only see and manage their own songs
- **Modern UI**: Custom Material-UI v7 theme with enhanced CSS styling

## Tech Stack

- **Next.js 14**: React framework with App Router
- **React 19**: Latest React version
- **TypeScript**: Type-safe development
- **Redux Toolkit**: State management
- **Material-UI v7**: UI component library with custom theme
- **LocalStorage**: Data persistence (for demo purposes)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```text
music_sys/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── login/        # Login page
│   │   ├── signup/       # Sign up page
│   │   └── songs/        # Songs pages (list, add, edit)
│   ├── components/       # React components
│   ├── store/            # Redux store and slices
│   ├── theme/            # Material-UI theme
│   ├── styles/           # Global CSS styles
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── package.json
└── tsconfig.json
```

## Usage

1. **Sign Up**: Create a new account with your name, email, and password
2. **Login**: Sign in with your credentials
3. **Add Songs**: Click "Add New Song" to add songs to your collection
4. **Manage Songs**: Edit or delete songs from your collection
5. **Search & Filter**: Use the search bar and filters to find specific songs
6. **Play**: Click the play button to simulate playing a song

## Notes

- Data is stored in browser localStorage for demo purposes
- In a production environment, you would connect to a backend API
- The play functionality is simulated (no actual audio playback)

## License

MIT
