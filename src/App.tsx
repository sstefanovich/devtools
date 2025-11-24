import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Base64Utility from './utilities/Base64Utility';
import CronUtility from './utilities/CronUtility';
import DataScienceUtility from './utilities/DataScienceUtility';
import EpochUtility from './utilities/EpochUtility';
import GuidUtility from './utilities/GuidUtility';
import MermaidUtility from './utilities/MermaidUtility';
import QRCodeUtility from './utilities/QRCodeUtility';
import RegexUtility from './utilities/RegexUtility';
import SpaceInvadersUtility from './utilities/SpaceInvadersUtility';
import TemperatureUtility from './utilities/TemperatureUtility';
import TimeZoneUtility from './utilities/TimeZoneUtility';
import URLUtility from './utilities/URLUtility';

function App() {
  return (
    <Layout>
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
        <Route path="/temperature" element={<TemperatureUtility />} />
        <Route path="/timezone" element={<TimeZoneUtility />} />
        <Route path="/url" element={<URLUtility />} />
      </Routes>
    </Layout>
  );
}

export default App;

