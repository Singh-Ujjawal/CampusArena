# Skeleton Loading Components

This folder contains skeleton loading components for the dashboard and other pages using `react-loading-skeleton`.

## Components

### 1. **EventCardSkeleton** 
- Skeleton for individual event cards
- Mimics the EventCard component structure
- Used for MCQ and Coding event loaders

### 2. **ContestCardSkeleton**
- Skeleton for individual contest cards  
- Shows placeholder for contest information
- Matches ContestCard styling

### 3. **SearchFilterSkeleton**
- Skeleton for search bar and filter buttons
- Displays loading state while filters load

### 4. **DashboardSkeleton**
- Complete dashboard page skeleton
- Shows loading state for entire dashboard
- Includes header, search/filter, and event/contest grids

## Usage

### In DashboardPage.tsx

```tsx
import { DashboardSkeleton } from '@/components/skeleton';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    
    // ... rest of component

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        // ... actual dashboard content
    );
}
```

### Individual Skeletons

```tsx
import { EventCardSkeleton, ContestCardSkeleton, SearchFilterSkeleton } from '@/components/skeleton';

// Show EventCardSkeleton while loading events
// Show ContestCardSkeleton while loading contests
// Show SearchFilterSkeleton while loading filters
```

## Features

- ✅ Tailwind CSS compatible
- ✅ Dark mode support (`dark:` prefix classes)
- ✅ Responsive grid layouts
- ✅ Smooth skeleton animations
- ✅ Accessible structure

## Installation

`react-loading-skeleton` is already installed. If not, run:

```bash
npm install react-loading-skeleton
```

## Customization

Each skeleton component can be customized by:
1. Adjusting the number of skeleton items in arrays
2. Modifying color values in `baseColor` and `highlightColor` props
3. Changing `Skeleton` component dimensions (width/height)
