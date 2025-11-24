import React, { useState, useEffect, useRef } from 'react';
import { Copy, FileCode, Download, AlertCircle } from 'lucide-react';
import mermaid from 'mermaid';

const MERMAID_EXAMPLES: Record<string, string> = {
  'flowchart': `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix issue]
    E --> B
    C --> F[End]`,
  
  'sequence': `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great!
    A-)B: See you later!`,
  
  'class': `classDiagram
    class Animal {
      +String name
      +int age
      +makeSound()
    }
    class Dog {
      +String breed
      +bark()
    }
    class Cat {
      +String color
      +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  
  'state': `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
  
  'er': `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
  
  'pie': `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
  
  'gantt': `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2024-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2024-01-12  , 12d
    another task     : 24d`,
  
  'timeline': `timeline
    title Timeline Example
    2024-01 : Project Start
    2024-02 : Design Phase
    2024-03 : Development
    2024-04 : Testing
    2024-05 : Launch`,
};

const MermaidUtility: React.FC = () => {
  const [mermaidCode, setMermaidCode] = useState<string>(MERMAID_EXAMPLES['flowchart']);
  const [selectedExample, setSelectedExample] = useState<string>('flowchart');
  const [error, setError] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
  }, []);

  // Render Mermaid diagram
  useEffect(() => {
    const renderDiagram = async () => {
      if (!mermaidCode.trim()) {
        setSvgContent('');
        setError('');
        return;
      }

      if (!mermaidContainerRef.current) return;

      try {
        setError('');
        // Clear previous content
        mermaidContainerRef.current.innerHTML = '';

        // Generate a unique ID for this diagram
        const id = `mermaid-${Date.now()}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, mermaidCode);
        
        if (mermaidContainerRef.current) {
          mermaidContainerRef.current.innerHTML = svg;
          setSvgContent(svg);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
        setError(errorMessage);
        setSvgContent('');
        if (mermaidContainerRef.current) {
          mermaidContainerRef.current.innerHTML = '';
        }
      }
    };

    // Debounce rendering
    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [mermaidCode]);

  const handleExampleSelect = (exampleKey: string) => {
    setSelectedExample(exampleKey);
    setMermaidCode(MERMAID_EXAMPLES[exampleKey]);
    setError('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadSVG = () => {
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearEditor = () => {
    setMermaidCode('');
    setError('');
    setSvgContent('');
    if (mermaidContainerRef.current) {
      mermaidContainerRef.current.innerHTML = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <FileCode className="h-8 w-8 text-pink-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Mermaid Diagram Editor</h1>
        </div>
        <p className="text-gray-600">
          Create beautiful diagrams using Mermaid syntax. Edit the code and see live preview.
        </p>
      </div>

      {/* Examples Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagram Examples</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(MERMAID_EXAMPLES).map((key) => (
            <button
              key={key}
              onClick={() => handleExampleSelect(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedExample === key
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mermaid Code</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(mermaidCode)}
                className="btn-secondary text-sm flex items-center space-x-1"
                title="Copy code"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={clearEditor}
                className="btn-secondary text-sm"
                title="Clear editor"
              >
                Clear
              </button>
            </div>
          </div>
          
          <textarea
            value={mermaidCode}
            onChange={(e) => setMermaidCode(e.target.value)}
            placeholder="Enter your Mermaid diagram code here..."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            spellCheck={false}
          />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 mb-1">Rendering Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            {svgContent && (
              <div className="flex space-x-2">
                <button
                  onClick={downloadSVG}
                  className="btn-secondary text-sm flex items-center space-x-1"
                  title="Download SVG"
                >
                  <Download className="h-4 w-4" />
                  <span>SVG</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="w-full min-h-96 p-4 border border-gray-300 rounded-lg bg-white overflow-auto flex items-center justify-center">
            {mermaidCode.trim() ? (
              <div
                ref={mermaidContainerRef}
                className="mermaid-container w-full flex items-center justify-center"
              />
            ) : (
              <p className="text-gray-400 text-center">Enter Mermaid code to see preview</p>
            )}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Mermaid Diagrams</h3>
        <div className="space-y-3 text-gray-600 text-sm">
          <p>
            Mermaid is a diagramming and charting tool that uses text-based syntax to create diagrams.
            It's perfect for documentation, architecture diagrams, flowcharts, and more.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Supported Diagram Types:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Flowchart:</strong> Process flows and decision trees</li>
                <li><strong>Sequence:</strong> Sequence diagrams and interactions</li>
                <li><strong>Class:</strong> Class diagrams and UML structures</li>
                <li><strong>State:</strong> State diagrams and transitions</li>
                <li><strong>ER:</strong> Entity relationship diagrams</li>
                <li><strong>Pie:</strong> Pie charts and proportions</li>
                <li><strong>Gantt:</strong> Gantt charts and timelines</li>
                <li><strong>Timeline:</strong> Timeline visualizations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tips:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Diagrams render automatically as you type (with a short delay)</li>
                <li>Select an example above to see different diagram types</li>
                <li>You can copy the code or download the SVG</li>
                <li>Syntax errors will be shown in the editor</li>
                <li>Check the <a href="https://mermaid.js.org/" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">Mermaid documentation</a> for more syntax</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidUtility;

