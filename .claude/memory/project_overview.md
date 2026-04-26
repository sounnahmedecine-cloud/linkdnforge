---
name: linkdnforge Project Overview
description: Link management platform for teams - Next.js app with marketing landing page, Firebase backend
type: project
---

## Project Description
**linkdnforge** is a link management and organization tool designed for teams. Currently, it features a professional marketing landing page with backend infrastructure in place.

## Tech Stack
- **Framework**: Next.js 14.2.3 (App Router)
- **Runtime**: React 18.3.1 + TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React
- **Database/Auth**: Firebase (Authentication + Firestore)
- **Linting**: ESLint v9

## Project Structure
- `src/app/page.tsx` - Landing page with hero, features, pricing, testimonials
- `src/app/layout.tsx` - Root layout with metadata
- `src/lib/firebase.ts` - Firebase config and guest authentication setup
- Configuration files: tsconfig.json, next.config.mjs, package.json, eslint.config.mjs

## Key Features
- Marketing landing page with 6 main sections
- Firebase guest login ready
- Pricing page (3 tiers: Starter free, Professional $9.99/mo, Enterprise custom)
- Feature highlights: smart organization, security, analytics, sync, sharing, team collaboration

## Dependencies
- firebase v12.12.1
- clsx, tailwind-merge (utility helpers)
- All standard Next.js/React development dependencies

## Status
Early stage - landing page complete, backend infrastructure in place, ready for core feature development.
