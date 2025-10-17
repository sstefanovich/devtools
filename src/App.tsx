import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Base64Utility from './utilities/Base64Utility';
import EpochUtility from './utilities/EpochUtility';
import TemperatureUtility from './utilities/TemperatureUtility';
import URLUtility from './utilities/URLUtility';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/base64" element={<Base64Utility />} />
        <Route path="/epoch" element={<EpochUtility />} />
        <Route path="/temperature" element={<TemperatureUtility />} />
        <Route path="/url" element={<URLUtility />} />
      </Routes>
    </Layout>
  );
}

export default App;

