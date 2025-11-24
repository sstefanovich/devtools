import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Copy, Download, Wifi, Link as LinkIcon, Mail, Phone } from 'lucide-react';
import QRCode from 'qrcode';

const QR_EXAMPLES: Record<string, string> = {
  'url': 'https://example.com',
  'text': 'Hello, World!',
  'wifi': 'WIFI:T:WPA;S:MyNetwork;P:mypassword123;;',
  'email': 'mailto:example@email.com?subject=Hello&body=Hi there!',
  'phone': 'tel:+1234567890',
  'sms': 'sms:+1234567890?body=Hello',
};

const QRCodeUtility: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [size, setSize] = useState<number>(256);
  const [margin, setMargin] = useState<number>(4);
  const [darkColor, setDarkColor] = useState<string>('#000000');
  const [lightColor, setLightColor] = useState<string>('#FFFFFF');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code
  useEffect(() => {
    const generateQRCode = async () => {
      if (!inputText.trim()) {
        setQrCodeDataUrl('');
        setError('');
        return;
      }

      try {
        setError('');
        const dataUrl = await QRCode.toDataURL(inputText, {
          width: size,
          margin: margin,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: 'M',
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
        setError(errorMessage);
        setQrCodeDataUrl('');
      }
    };

    // Debounce generation
    const timeoutId = setTimeout(() => {
      generateQRCode();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputText, size, margin, darkColor, lightColor]);

  const handleExampleSelect = (exampleKey: string) => {
    setInputText(QR_EXAMPLES[exampleKey]);
    setError('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadQRCode = async (format: 'png' | 'svg') => {
    if (!qrCodeDataUrl && !inputText.trim()) return;

    try {
      if (format === 'png') {
        // Download as PNG
        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = 'qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate and download as SVG
        const svg = await QRCode.toString(inputText, {
          type: 'svg',
          width: size,
          margin: margin,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: 'M',
        });
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qrcode.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to download QR code');
      console.error(err);
    }
  };

  const clearAll = () => {
    setInputText('');
    setQrCodeDataUrl('');
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <QrCode className="h-8 w-8 text-teal-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
        </div>
        <p className="text-gray-600">
          Generate QR codes from text, URLs, WiFi credentials, and more
        </p>
      </div>

      {/* Examples Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Examples</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => handleExampleSelect('url')}
            className="btn-secondary text-sm flex items-center justify-center space-x-1"
          >
            <LinkIcon className="h-4 w-4" />
            <span>URL</span>
          </button>
          <button
            onClick={() => handleExampleSelect('text')}
            className="btn-secondary text-sm flex items-center justify-center space-x-1"
          >
            <Copy className="h-4 w-4" />
            <span>Text</span>
          </button>
          <button
            onClick={() => handleExampleSelect('wifi')}
            className="btn-secondary text-sm flex items-center justify-center space-x-1"
          >
            <Wifi className="h-4 w-4" />
            <span>WiFi</span>
          </button>
          <button
            onClick={() => handleExampleSelect('email')}
            className="btn-secondary text-sm flex items-center justify-center space-x-1"
          >
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </button>
          <button
            onClick={() => handleExampleSelect('phone')}
            className="btn-secondary text-sm flex items-center justify-center space-x-1"
          >
            <Phone className="h-4 w-4" />
            <span>Phone</span>
          </button>
          <button
            onClick={() => handleExampleSelect('sms')}
            className="btn-secondary text-sm flex items-center justify-center space-x-1"
          >
            <Phone className="h-4 w-4" />
            <span>SMS</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Text or URL
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text, URL, or use examples above..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => copyToClipboard(inputText)}
                className="btn-secondary text-sm flex items-center space-x-1"
                disabled={!inputText.trim()}
              >
                <Copy className="h-4 w-4" />
                <span>Copy Text</span>
              </button>
              <button
                onClick={clearAll}
                className="btn-secondary text-sm"
                disabled={!inputText.trim()}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Customization</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size: {size}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margin: {margin}
              </label>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dark Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Light Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded font-mono text-sm"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* QR Code Preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">QR Code Preview</h3>
            {qrCodeDataUrl && (
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadQRCode('png')}
                  className="btn-secondary text-sm flex items-center space-x-1"
                  title="Download as PNG"
                >
                  <Download className="h-4 w-4" />
                  <span>PNG</span>
                </button>
                <button
                  onClick={() => downloadQRCode('svg')}
                  className="btn-secondary text-sm flex items-center space-x-1"
                  title="Download as SVG"
                >
                  <Download className="h-4 w-4" />
                  <span>SVG</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-64">
            {qrCodeDataUrl ? (
              <div className="text-center space-y-4">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="mx-auto border border-gray-200 rounded-lg shadow-sm"
                />
                <p className="text-xs text-gray-500">
                  Scan with any QR code reader
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <QrCode className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p>Enter text above to generate QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About QR Codes</h3>
        <div className="space-y-3 text-gray-600 text-sm">
          <p>
            QR (Quick Response) codes are two-dimensional barcodes that can store various types of data.
            They can be scanned by smartphones and QR code readers to quickly access information.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Supported Formats:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>URL:</strong> Web links (https://example.com)</li>
                <li><strong>Text:</strong> Plain text messages</li>
                <li><strong>WiFi:</strong> Network credentials (WIFI:T:WPA;S:Network;P:Password;;)</li>
                <li><strong>Email:</strong> Email addresses with subject/body</li>
                <li><strong>Phone:</strong> Phone numbers (tel:+1234567890)</li>
                <li><strong>SMS:</strong> Text messages (sms:+1234567890?body=Message)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tips:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>QR codes update automatically as you type</li>
                <li>Larger sizes are easier to scan from a distance</li>
                <li>Custom colors can match your brand or design</li>
                <li>Download as PNG for images, SVG for scalable graphics</li>
                <li>Use the examples above to see different QR code types</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeUtility;

