# Deployment Guide

## Azure Static Web Apps Deployment

This application is ready for deployment to Azure Static Web Apps. Here's how to deploy it:

### Prerequisites

1. Azure CLI installed
2. Node.js (16 or higher) and npm installed locally
3. Azure subscription

### Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

### Azure Deployment Options

#### Option 1: Azure Portal (Recommended)

1. Go to the Azure Portal
2. Create a new Static Web App resource
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output location: `dist`
5. Deploy automatically on push to main branch

#### Option 2: Azure CLI

1. Install Azure Static Web Apps CLI:
```bash
npm install -g @azure/static-web-apps-cli
```

2. Login to Azure:
```bash
az login
```

3. Deploy:
```bash
swa deploy dist --deployment-token <your-deployment-token>
```

#### Option 3: GitHub Actions

The application includes proper routing configuration (`web.config`) for Azure Static Web Apps to handle React Router's client-side routing.

### Build Configuration

The application is configured with:
- **Framework**: React with TypeScript
- **Build tool**: Vite
- **Output directory**: `dist`
- **Routing**: Client-side routing with fallback to index.html

### Environment Variables

No environment variables are required for this application as it's a pure client-side utility suite.

### Custom Domain

After deployment, you can configure a custom domain through the Azure Portal:
1. Go to your Static Web App resource
2. Navigate to "Custom domains"
3. Add your domain and configure DNS settings

### Performance Optimization

The application is already optimized with:
- Vite for fast builds and HMR
- Tailwind CSS purging for minimal CSS bundle
- Tree-shaking for optimal JavaScript bundle size
- Static assets optimized for CDN delivery

### Monitoring

Azure Static Web Apps provides built-in monitoring and analytics through:
- Application Insights integration
- Custom metrics and logging
- Performance monitoring
- Error tracking

