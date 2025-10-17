# DevTools - Developer Utilities Suite

A modern, responsive web application built with React, TypeScript, and Tailwind CSS that provides a collection of essential developer utilities.

## Features

- **Base64 Encode/Decode**: Convert text to Base64 format or decode Base64 back to readable text
- **Unix Epoch Converter**: Convert Unix timestamps to human-readable dates and vice versa with timezone support
- **Temperature Converter**: Convert between Fahrenheit, Celsius, and Kelvin with real-time updates

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dev-tools-utilities
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to Azure Static Web Apps or any static hosting service.

## Deployment to Azure Static Web Apps

This application is configured for easy deployment to Azure Static Web Apps:

1. The `web.config` file is included for proper routing support
2. Build output goes to the `dist` directory
3. No server-side dependencies required

### Azure Deployment Steps

1. Create an Azure Static Web App resource
2. Connect your repository to Azure
3. Set build configuration:
   - Build command: `npm run build`
   - Output location: `dist`
4. Deploy!

## Adding New Utilities

The application is designed to be easily extensible. To add a new utility:

1. Create a new component in the `src/utilities/` directory
2. Add the utility to the `utilities` array in `src/pages/HomePage.tsx`
3. Add a new route in `src/App.tsx`
4. Choose an appropriate icon from Lucide React

### Example Utility Structure

```typescript
// src/utilities/NewUtility.tsx
import React, { useState } from 'react';
import { IconName } from 'lucide-react';

const NewUtility: React.FC = () => {
  // Your utility logic here
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <IconName className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">New Utility</h1>
        </div>
        <p className="text-gray-600">
          Description of what this utility does
        </p>
      </div>

      {/* Utility implementation */}
      <div className="card">
        {/* Your utility interface */}
      </div>
    </div>
  );
};

export default NewUtility;
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Layout.tsx      # Main layout with navigation
├── pages/              # Page components
│   └── HomePage.tsx    # Homepage with utility cards
├── utilities/          # Individual utility components
│   ├── Base64Utility.tsx
│   ├── EpochUtility.tsx
│   └── TemperatureUtility.tsx
├── types/              # TypeScript type definitions
│   └── utility.ts
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
