import { Link } from 'react-router-dom';
import { Calendar, Calculator, Clock, Code, FileCode, FileText, Gamepad2, Globe, Key, Link as LinkIcon, QrCode, Thermometer } from 'lucide-react';

const utilities = [
  {
    id: 'base64',
    name: 'Base64 Encode/Decode',
    description: 'Encode text to Base64 or decode Base64 to text',
    icon: FileText,
    path: '/base64',
    color: 'bg-blue-500',
  },
  {
    id: 'cron',
    name: 'CRON Parser & Builder',
    description: 'Parse CRON expressions to understand schedules or build new expressions',
    icon: Calendar,
    path: '/cron',
    color: 'bg-cyan-500',
  },
  {
    id: 'data-science',
    name: 'Data Science Formulas',
    description: 'Explore ML model formulas and calculate evaluation metrics',
    icon: Calculator,
    path: '/data-science',
    color: 'bg-indigo-500',
  },
  {
    id: 'epoch',
    name: 'Unix Epoch Converter',
    description: 'Convert Unix timestamp to human-readable date and time',
    icon: Clock,
    path: '/epoch',
    color: 'bg-green-500',
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    description: 'Test JavaScript regular expressions with live highlighting',
    icon: Code,
    path: '/regex',
    color: 'bg-indigo-500',
  },
  {
    id: 'space-invaders',
    name: 'Space Invaders',
    description: 'Classic arcade game - defend Earth from alien invaders!',
    icon: Gamepad2,
    path: '/space-invaders',
    color: 'bg-purple-500',
  },
  {
    id: 'temperature',
    name: 'Temperature Converter',
    description: 'Convert between Fahrenheit and Celsius',
    icon: Thermometer,
    path: '/temperature',
    color: 'bg-red-500',
  },
  {
    id: 'timezone',
    name: 'Time Zone Converter',
    description: 'Compare local time across multiple global time zones',
    icon: Globe,
    path: '/timezone',
    color: 'bg-emerald-500',
  },
  {
    id: 'url',
    name: 'URL Encoder/Decoder',
    description: 'Encode text to URL-safe format or decode URL-encoded text',
    icon: LinkIcon,
    path: '/url',
    color: 'bg-purple-500',
  },
  {
    id: 'guid',
    name: 'GUID Generator',
    description: 'Generate unique GUIDs (Globally Unique Identifiers) in various formats',
    icon: Key,
    path: '/guid',
    color: 'bg-orange-500',
  },
  {
    id: 'mermaid',
    name: 'Mermaid Diagram Editor',
    description: 'Create and edit diagrams using Mermaid syntax with live preview',
    icon: FileCode,
    path: '/mermaid',
    color: 'bg-pink-500',
  },
  {
    id: 'qrcode',
    name: 'QR Code Generator',
    description: 'Generate QR codes from text, URLs, WiFi credentials, and more',
    icon: QrCode,
    path: '/qrcode',
    color: 'bg-teal-500',
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Developer Tools Utility Suite
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A collection of essential developer utilities to help you work more efficiently. 
          All tools are free, fast, and work entirely in your browser.
        </p>
      </div>

      {/* Utilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {utilities.map((utility) => {
          const IconComponent = utility.icon;
          return (
            <Link
              key={utility.id}
              to={utility.path}
              className="group block"
            >
              <div className="card hover:shadow-lg transition-shadow duration-200 h-full">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${utility.color} text-white flex-shrink-0`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {utility.name}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {utility.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Choose DevTools?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-primary-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-600 font-bold">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast & Lightweight</h3>
            <p className="text-gray-600 text-sm">
              All utilities run locally in your browser with no server dependencies.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-600 font-bold">🔒</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-gray-600 text-sm">
              Your data never leaves your browser. No tracking, no data collection.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-600 font-bold">🆓</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Always Free</h3>
            <p className="text-gray-600 text-sm">
              No subscriptions, no premium features. Everything is completely free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

