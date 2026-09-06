# AGENTS.md

> **AI Coding Assistant Instructions** - This document guides AI tools (GitHub Copilot, Cursor, Claude, etc.) on how to work with this codebase effectively.

---

## Project Overview

**Description**: **THULIR** is a full-scale IoT early-warning and continuous environmental/structural monitoring platform designed for real-time telemetry from physical sensor nodes (ESP8266 NodeMCU) with direct Supabase PostgreSQL ingestion and a live React/TypeScript dashboard.

**Tech Stack**:
- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **State Management**: React Context API
- **Routing**: Not configured
- **Data Fetching**: fetch API
- **Forms**: Native forms
- **Validation**: Manual validation
- **Testing**: Not configured
- **Package Manager**: npm

---

## Quick Start

```bash
# Setup
npm install

# Development
npm run dev

# Build
npm run build

# Testing
npm run test

# Linting
npm run lint
```

---

## Project Structure

```
src/
├── assets/
├── components/
├── config/
├── hooks/
├── lib/
├── pages/
├── services/
├── types/
└── utils/
```

**Directory Purposes**:

- **`assets/`** - Static assets
- **`components/`** - Reusable UI components
- **`config/`** - Configuration files
- **`hooks/`** - Custom React hooks
- **`lib/`** - Third-party library configurations
- **`pages/`** - Page/route components
- **`services/`** - API services and external integrations
- **`types/`** - TypeScript type definitions
- **`utils/`** - Utility functions

---

## Code Conventions

### General Guidelines

- **Language**: Use TypeScript for all files
- **Components**: Use functional components with hooks
- **File Naming**: PascalCase for components, camelCase for utilities

### Component Structure

```tsx
import { useState } from 'react';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### Import Organization

```tsx
// 1. External dependencies
import { useState } from 'react';

// 2. Internal modules (use path aliases)
import { Component } from '../components/Component';

// 3. Types
import type { User } from '@/types';

// 4. Styles (if applicable)
import styles from './Component.module.css';
```

---

## Styling Approach

**Primary Method**: CSS Modules

- One CSS module per component
- Use camelCase for class names
- Leverage composition with `composes`

---

## State Management

**Approach**: React Context API

- Create context providers in `src/context/`
- Separate context by domain
- Use custom hooks to access context

---

## Data Fetching

**Method**: fetch API

- All API calls should be organized in the services layer
- Use proper error handling and loading states
- Leverage fetch API features for caching and optimistic updates

---

## Routing

**Router**: Not configured



---

## Forms & Validation

**Forms**: Native forms
**Validation**: Manual validation



---

## Testing

**Framework**: Not configured

### Conventions

- Test file location: Co-located with components
- Naming: `ComponentName.test.tsx`
- Focus on user behavior and integration tests

---

## Environment Variables

**Location**: `.env.local`

```bash
VITE_SUPABASE_URL=[value]
VITE_SUPABASE_ANON_KEY=[value]
```

**Note**: Never commit `.env.local` - use `.env.example` as template

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run linter
- `npm run preview` - vite preview

---

## Path Aliases

No path aliases configured.

---

## AI Assistant Guidelines

### When Generating Code

1. **Follow existing patterns**: Match the style and structure in the codebase
2. **Use type safety**: Always use TypeScript types
3. **Use path aliases**: Import using configured aliases
4. **Match styling approach**: Use CSS Modules conventions
5. **Follow state management**: Use React Context API patterns

### When Refactoring

1. Preserve functionality
2. Maintain type safety
3. Update related tests
4. Follow established conventions

---

**Last Generated**: 2026-09-06  
**Auto-generated from**: package.json, tsconfig.json, and project structure

> 💡 **Tip**: Use the Agent Automation dashboard to regenerate this file after major changes.
