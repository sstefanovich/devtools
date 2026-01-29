import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';

// Lazy load utilities for code-splitting
const Base64Utility = lazy(() => import('./utilities/Base64Utility'));
const CronUtility = lazy(() => import('./utilities/CronUtility'));
const DataScienceUtility = lazy(() => import('./utilities/DataScienceUtility'));
const EpochUtility = lazy(() => import('./utilities/EpochUtility'));
const GuidUtility = lazy(() => import('./utilities/GuidUtility'));
const MermaidUtility = lazy(() => import('./utilities/MermaidUtility'));
const QRCodeUtility = lazy(() => import('./utilities/QRCodeUtility'));
const RegexUtility = lazy(() => import('./utilities/RegexUtility'));
const SpaceInvadersUtility = lazy(() => import('./utilities/SpaceInvadersUtility'));
const StatisticalCalculatorUtility = lazy(() => import('./utilities/StatisticalCalculatorUtility'));
const TemperatureUtility = lazy(() => import('./utilities/TemperatureUtility'));
const TimeZoneUtility = lazy(() => import('./utilities/TimeZoneUtility'));
const URLUtility = lazy(() => import('./utilities/URLUtility'));
const MemorySizeUtility = lazy(() => import('./utilities/MemorySizeUtility'));
const LogicBuilderUtility = lazy(() => import('./utilities/LogicBuilderUtility'));

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/base64" element={<Base64Utility />} />
          <Route path="/cron" element={<CronUtility />} />
          <Route path="/data-science" element={<DataScienceUtility />} />
          <Route path="/epoch" element={<EpochUtility />} />
          <Route path="/guid" element={<GuidUtility />} />
          <Route path="/mermaid" element={<MermaidUtility />} />
          <Route path="/qrcode" element={<QRCodeUtility />} />
          <Route path="/regex" element={<RegexUtility />} />
          <Route path="/space-invaders" element={<SpaceInvadersUtility />} />
          <Route path="/statistics" element={<StatisticalCalculatorUtility />} />
          <Route path="/temperature" element={<TemperatureUtility />} />
          <Route path="/timezone" element={<TimeZoneUtility />} />
          <Route path="/url" element={<URLUtility />} />
          <Route path="/memory-size" element={<MemorySizeUtility />} />
          <Route path="/logic-builder" element={<LogicBuilderUtility />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;

