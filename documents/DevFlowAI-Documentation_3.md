# DevFlow AI — Week 11-12 Complete Documentation

> **Stack:** React Native CLI · React Navigation · Zustand · Nativewind (Tailwind for RN)  
> **Period:** Week 11–12 (Days 71–90)  
> **Status:** Mobile App, Settings/Profiles, Landing Page, and Platform Polish Complete

---

## Table of Contents

1. [Mobile App Architecture (React Native)](#1-mobile-app-architecture-react-native)
2. [Mobile Authentication & Persistence](#2-mobile-authentication--persistence)
3. [User Profiles & Settings (Cross-Platform)](#3-user-profiles--settings-cross-platform)
4. [Web Landing Page & Visual Polish](#4-web-landing-page--visual-polish)
5. [Final Platform Deployment & Review](#5-final-platform-deployment--review)

---

## 1. Mobile App Architecture (React Native)

To ensure developers can access their DevFlow AI workspace on the go, we built a native mobile application using **React Native CLI** (not Expo).

### Why React Native CLI?
While Expo is great for rapid prototyping, React Native CLI gives us absolute control over native iOS/Android modules and background processes, which is crucial for a developer-focused app that may need complex background sync capabilities later.

### Folder Structure
The app lives in `apps/mobile/DevFlowMobile/src`. We strictly mirror the web app's architecture where possible.
```
src/
├── assets/         # Images, fonts (e.g., logo.png)
├── components/     # Reusable UI (Buttons, Cards, Inputs)
├── hooks/          # React Query hooks (useWorkspaces, useProjects)
├── navigation/     # React Navigation setup (Root, Stacks, Tabs)
├── screens/        # Full-page components
│   ├── app/        # Authenticated screens (Dashboard, Projects, Chat)
│   └── auth/       # Public screens (Login, Register)
├── store/          # Zustand global state (auth.store.ts)
└── lib/            # Axios instance and utilities
```

### Navigation Strategy
We use `@react-navigation/native`.
1. **RootNavigator**: The top-level component. It displays a Splash Screen (`<Image source={require('../assets/logo.png')} />`) while checking `AsyncStorage` for a JWT.
2. **AuthStack**: If no JWT is found, it loads a native Stack Navigator with `LoginScreen` and `RegisterScreen`.
3. **AppTabs**: If a JWT is found, it loads a Bottom Tab Navigator (`createBottomTabNavigator`) with four primary tabs:
   - **Dashboard**: High-level stats.
   - **Workspaces/Projects**: Hierarchical navigation.
   - **AI Chat**: Mobile RAG interface.
   - **Profile**: Settings and Logout.

---

## 2. Mobile Authentication & Persistence

Rebuilding the seamless authentication flow for mobile required translating web concepts (localStorage/Cookies) to native concepts.

### Zustand + AsyncStorage
On the web, we used Zustand's `persist` middleware with `localStorage`. In React Native, `localStorage` does not exist.

Instead, we built a custom hydration function in `auth.store.ts` that manually reads and writes to `@react-native-async-storage/async-storage`:

```typescript
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Crucial for showing the Splash Screen

  login: async (token, user) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  restoreToken: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false }); // Hide Splash Screen
    }
  }
}));
```

### Mobile Axios Interceptor
Just like the web app, the mobile app uses an Axios interceptor to silently catch `401 Unauthorized` errors and request a new token using the Refresh Token. Because we don't have HTTP-Only cookies on mobile, both tokens are kept in encrypted secure storage natively.

---

## 3. User Profiles & Settings (Cross-Platform)

We finalized the user management system by allowing developers to change their display names and passwords.

### Backend Endpoints
We added two new protected routes to the NestJS `AuthController`:
1. `PUT /auth/profile`: Accepts a `name` field, updates the user in Prisma, and returns the new profile.
2. `PUT /auth/change-password`: Accepts `currentPassword` and `newPassword`.
   - Validates `currentPassword` against the stored `bcrypt` hash.
   - Hashes `newPassword` and updates the database.

### Web `Settings` Page
Located at `apps/web/src/app/dashboard/settings/page.tsx`.
- Uses `react-hook-form` + `zod` for robust client-side validation.
- Displays loading spinners on the submit buttons using `lucide-react`.

### Mobile `ProfileScreen`
Located at `apps/mobile/DevFlowMobile/src/screens/app/ProfileScreen.tsx`.
- Uses React Native `<TextInput>` and `<ScrollView>` components.
- Manages local `loading` state during the API request and utilizes React Native's native `Alert.alert()` to provide success/failure feedback to the user.

---

## 4. Web Landing Page & Visual Polish

First impressions matter. We replaced the default Next.js boilerplate with a high-conversion, professional landing page.

### The Hero Section
Located in `apps/web/src/app/page.tsx`.
- **Gradient Text**: Uses Tailwind's `bg-clip-text text-transparent bg-gradient-to-r` to create a vibrant, tech-forward aesthetic.
- **Theme Integration**: Integrates the existing `ThemeToggle` component, seamlessly switching between a stark white background and a sleek dark mode.
- **Micro-Animations**: Uses `animate-in fade-in slide-in-from-bottom` utility classes to smoothly fade the elements into view when the page loads.

### Fixing the Logo Cache Bug
**The Problem**: The Next.js dev server aggressively cached the `public/` directory, causing `<img src="/logo.png" />` to render as a broken image icon.
**The Fix**: We bypassed the static cache by forcing Webpack to bundle the image:
```typescript
import Image from 'next/image';
import logoImage from '../../../public/logo.png'; // Static import

<Image src={logoImage} alt="DevFlow AI Logo" />
```
This guarantees the image is hashed and served correctly, even during hot-reloads.

### Middleware Fix
We updated `middleware.ts` to explicitly allow unauthenticated traffic to the root path (`'/'`), ensuring the new landing page is visible to everyone, while still fiercely protecting the `/dashboard` routes.

---

## 5. Final Platform Deployment & Review

At the end of Week 12, DevFlow AI stands as a complete, unified system.

### The Monorepo Advantage Realized
- A single `git pull` updates the Web, Mobile, and Backend simultaneously.
- The PostgreSQL + Redis + Ollama Docker setup guarantees that any new developer can run `docker-compose up` and have the entire infrastructure running locally in minutes.
- The React Native app shares the exact same API payloads and Zustand logic patterns as the Next.js web app, drastically reducing cognitive load.

### Ready for Scale
DevFlow AI is now production-ready for individual developers to manage their code, take intelligent notes, and harness the power of private, local AI. 

*End of Document 3.*
