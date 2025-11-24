import React, { useState } from 'react';
import { Calculator, Copy, TrendingUp, BarChart3 } from 'lucide-react';

interface Formula {
  name: string;
  formula: string;
  description: string;
  latex?: string;
}

interface ModelFormulas {
  model: string;
  description: string;
  formulas: Formula[];
}

const MODEL_FORMULAS: Record<string, ModelFormulas> = {
  'linear-regression': {
    model: 'Linear Regression',
    description: 'Predicts continuous values using a linear relationship',
    formulas: [
      {
        name: 'Hypothesis Function',
        formula: 'h(x) = θ₀ + θ₁x₁ + θ₂x₂ + ... + θₙxₙ',
        description: 'Predicted output as a linear combination of features',
        latex: 'h(x) = \\theta_0 + \\theta_1 x_1 + \\theta_2 x_2 + \\cdots + \\theta_n x_n',
      },
      {
        name: 'Cost Function (MSE)',
        formula: 'J(θ) = (1/2m) Σ(h(x⁽ⁱ⁾) - y⁽ⁱ⁾)²',
        description: 'Mean Squared Error - measures average squared difference',
        latex: 'J(\\theta) = \\frac{1}{2m} \\sum_{i=1}^{m} (h(x^{(i)}) - y^{(i)})^2',
      },
      {
        name: 'Gradient Descent Update',
        formula: 'θⱼ := θⱼ - α ∂J(θ)/∂θⱼ',
        description: 'Update rule for minimizing the cost function',
        latex: '\\theta_j := \\theta_j - \\alpha \\frac{\\partial J(\\theta)}{\\partial \\theta_j}',
      },
      {
        name: 'R² Score',
        formula: 'R² = 1 - (SS_res / SS_tot)',
        description: 'Coefficient of determination - proportion of variance explained',
        latex: 'R^2 = 1 - \\frac{SS_{res}}{SS_{tot}}',
      },
    ],
  },
  'logistic-regression': {
    model: 'Logistic Regression',
    description: 'Predicts binary classification probabilities using sigmoid function',
    formulas: [
      {
        name: 'Hypothesis Function',
        formula: 'h(x) = 1 / (1 + e^(-z)) where z = θᵀx',
        description: 'Sigmoid function that outputs probabilities between 0 and 1',
        latex: 'h(x) = \\frac{1}{1 + e^{-z}}, \\quad z = \\theta^T x',
      },
      {
        name: 'Cost Function (Log Loss)',
        formula: 'J(θ) = -(1/m) Σ[y⁽ⁱ⁾log(h(x⁽ⁱ⁾)) + (1-y⁽ⁱ⁾)log(1-h(x⁽ⁱ⁾))]',
        description: 'Binary cross-entropy loss for classification',
        latex: 'J(\\theta) = -\\frac{1}{m} \\sum_{i=1}^{m} [y^{(i)}\\log(h(x^{(i)})) + (1-y^{(i)})\\log(1-h(x^{(i)}))]',
      },
      {
        name: 'Decision Boundary',
        formula: 'θᵀx = 0',
        description: 'Threshold where probability equals 0.5',
        latex: '\\theta^T x = 0',
      },
    ],
  },
  'neural-network': {
    model: 'Neural Networks',
    description: 'Multi-layer networks for complex pattern recognition',
    formulas: [
      {
        name: 'Forward Propagation',
        formula: 'a⁽ˡ⁾ = g(z⁽ˡ⁾) where z⁽ˡ⁾ = W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾',
        description: 'Calculate activations layer by layer',
        latex: 'a^{(l)} = g(z^{(l)}), \\quad z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)}',
      },
      {
        name: 'Backpropagation',
        formula: 'δ⁽ˡ⁾ = (W⁽ˡ⁺¹⁾)ᵀδ⁽ˡ⁺¹⁾ ⊙ g\'(z⁽ˡ⁾)',
        description: 'Calculate error gradients for weight updates',
        latex: '\\delta^{(l)} = (W^{(l+1)})^T \\delta^{(l+1)} \\odot g\'(z^{(l)})',
      },
      {
        name: 'Weight Update',
        formula: 'W⁽ˡ⁾ := W⁽ˡ⁾ - α ∇W⁽ˡ⁾',
        description: 'Update weights using gradient descent',
        latex: 'W^{(l)} := W^{(l)} - \\alpha \\nabla_{W^{(l)}}',
      },
      {
        name: 'Cross-Entropy Loss',
        formula: 'L = -Σ yᵢ log(ŷᵢ)',
        description: 'Multi-class classification loss',
        latex: 'L = -\\sum_{i} y_i \\log(\\hat{y}_i)',
      },
    ],
  },
  'svm': {
    model: 'Support Vector Machine',
    description: 'Finds optimal hyperplane for classification',
    formulas: [
      {
        name: 'Decision Function',
        formula: 'f(x) = wᵀx + b',
        description: 'Linear decision boundary',
        latex: 'f(x) = w^T x + b',
      },
      {
        name: 'Hinge Loss',
        formula: 'L = max(0, 1 - yᵢ(wᵀxᵢ + b))',
        description: 'Loss function that penalizes misclassifications',
        latex: 'L = \\max(0, 1 - y_i(w^T x_i + b))',
      },
      {
        name: 'Kernel Trick',
        formula: 'K(xᵢ, xⱼ) = φ(xᵢ)ᵀφ(xⱼ)',
        description: 'Implicit mapping to higher dimensions',
        latex: 'K(x_i, x_j) = \\phi(x_i)^T \\phi(x_j)',
      },
    ],
  },
};

const METRICS_CALCULATORS = {
  'mse': {
    name: 'Mean Squared Error (MSE)',
    formula: 'MSE = (1/n) Σ(yᵢ - ŷᵢ)²',
    description: 'Average of squared differences between predicted and actual values',
    calculate: (actual: number[], predicted: number[]): number => {
      if (actual.length !== predicted.length) return NaN;
      const sum = actual.reduce((acc, val, i) => acc + Math.pow(val - predicted[i], 2), 0);
      return sum / actual.length;
    },
  },
  'mae': {
    name: 'Mean Absolute Error (MAE)',
    formula: 'MAE = (1/n) Σ|yᵢ - ŷᵢ|',
    description: 'Average of absolute differences between predicted and actual values',
    calculate: (actual: number[], predicted: number[]): number => {
      if (actual.length !== predicted.length) return NaN;
      const sum = actual.reduce((acc, val, i) => acc + Math.abs(val - predicted[i]), 0);
      return sum / actual.length;
    },
  },
  'rmse': {
    name: 'Root Mean Squared Error (RMSE)',
    formula: 'RMSE = √MSE',
    description: 'Square root of MSE - same units as target variable',
    calculate: (actual: number[], predicted: number[]): number => {
      if (actual.length !== predicted.length) return NaN;
      const sum = actual.reduce((acc, val, i) => acc + Math.pow(val - predicted[i], 2), 0);
      return Math.sqrt(sum / actual.length);
    },
  },
  'accuracy': {
    name: 'Accuracy',
    formula: 'Accuracy = (TP + TN) / (TP + TN + FP + FN)',
    description: 'Proportion of correct predictions',
    calculate: (actual: number[], predicted: number[]): number => {
      if (actual.length !== predicted.length) return NaN;
      const correct = actual.reduce((acc, val, i) => acc + (val === predicted[i] ? 1 : 0), 0);
      return correct / actual.length;
    },
  },
  'precision': {
    name: 'Precision',
    formula: 'Precision = TP / (TP + FP)',
    description: 'Proportion of positive predictions that are correct',
    calculate: (actual: number[], predicted: number[]): number => {
      if (actual.length !== predicted.length) return NaN;
      let tp = 0, fp = 0;
      actual.forEach((val, i) => {
        if (predicted[i] === 1) {
          if (val === 1) tp++;
          else fp++;
        }
      });
      return tp + fp === 0 ? 0 : tp / (tp + fp);
    },
  },
  'recall': {
    name: 'Recall (Sensitivity)',
    formula: 'Recall = TP / (TP + FN)',
    description: 'Proportion of actual positives that are correctly identified',
    calculate: (actual: number[], predicted: number[]): number => {
      if (actual.length !== predicted.length) return NaN;
      let tp = 0, fn = 0;
      actual.forEach((val, i) => {
        if (val === 1) {
          if (predicted[i] === 1) tp++;
          else fn++;
        }
      });
      return tp + fn === 0 ? 0 : tp / (tp + fn);
    },
  },
  'f1': {
    name: 'F1 Score',
    formula: 'F1 = 2 × (Precision × Recall) / (Precision + Recall)',
    description: 'Harmonic mean of precision and recall',
    calculate: (actual: number[], predicted: number[]): number => {
      if (actual.length !== predicted.length) return NaN;
      const precision = METRICS_CALCULATORS.precision.calculate(actual, predicted);
      const recall = METRICS_CALCULATORS.recall.calculate(actual, predicted);
      return precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    },
  },
};

const DataScienceUtility: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('linear-regression');
  const [selectedMetric, setSelectedMetric] = useState<string>('mse');
  const [actualValues, setActualValues] = useState<string>('');
  const [predictedValues, setPredictedValues] = useState<string>('');
  const [metricResult, setMetricResult] = useState<number | null>(null);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
    setMetricResult(null);
  };

  const calculateMetric = () => {
    try {
      const actual = actualValues.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      const predicted = predictedValues.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

      if (actual.length === 0 || predicted.length === 0) {
        setMetricResult(null);
        return;
      }

      const metric = METRICS_CALCULATORS[selectedMetric as keyof typeof METRICS_CALCULATORS];
      const result = metric.calculate(actual, predicted);
      setMetricResult(isNaN(result) ? null : result);
    } catch (err) {
      setMetricResult(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const loadExample = () => {
    if (selectedMetric === 'mse' || selectedMetric === 'mae' || selectedMetric === 'rmse') {
      setActualValues('2.5, 3.0, 2.8, 3.2, 2.9');
      setPredictedValues('2.4, 3.1, 2.7, 3.3, 2.8');
    } else {
      setActualValues('1, 0, 1, 1, 0, 1, 0, 0, 1, 1');
      setPredictedValues('1, 0, 1, 0, 0, 1, 1, 0, 1, 1');
    }
  };

  const currentModel = MODEL_FORMULAS[selectedModel];
  const currentMetric = METRICS_CALCULATORS[selectedMetric as keyof typeof METRICS_CALCULATORS];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Calculator className="h-8 w-8 text-indigo-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Data Science Formulas & Calculators</h1>
        </div>
        <p className="text-gray-600">
          Explore formulas for common ML models and calculate evaluation metrics
        </p>
      </div>

      {/* Model Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Machine Learning Model</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.keys(MODEL_FORMULAS).map((key) => (
            <button
              key={key}
              onClick={() => handleModelChange(key)}
              className={`p-4 rounded-lg font-medium transition-colors text-left ${
                selectedModel === key
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="font-semibold">{MODEL_FORMULAS[key].model}</div>
              <div className={`text-xs mt-1 ${selectedModel === key ? 'text-indigo-100' : 'text-gray-600'}`}>
                {MODEL_FORMULAS[key].description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Model Formulas */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {currentModel.model} Formulas
        </h3>
        <p className="text-gray-600 mb-6">{currentModel.description}</p>
        
        <div className="space-y-6">
          {currentModel.formulas.map((formula, index) => (
            <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
              <h4 className="font-semibold text-gray-900 mb-2">{formula.name}</h4>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <code className="text-lg font-mono text-gray-900">{formula.formula}</code>
              </div>
              <p className="text-sm text-gray-600 mb-2">{formula.description}</p>
              <button
                onClick={() => copyToClipboard(formula.formula)}
                className="btn-secondary text-xs flex items-center space-x-1"
              >
                <Copy className="h-3 w-3" />
                <span>Copy Formula</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Calculator */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Metrics Calculator</h3>
        
        {/* Metric Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Metric</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.keys(METRICS_CALCULATORS).map((key) => (
              <button
                key={key}
                onClick={() => handleMetricChange(key)}
                className={`p-3 rounded-lg font-medium transition-colors text-sm ${
                  selectedMetric === key
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {METRICS_CALCULATORS[key as keyof typeof METRICS_CALCULATORS].name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-indigo-900 mb-2">{currentMetric.name}</h4>
          <div className="bg-white rounded p-3 mb-2">
            <code className="text-sm font-mono text-gray-900">{currentMetric.formula}</code>
          </div>
          <p className="text-sm text-indigo-700">{currentMetric.description}</p>
        </div>

        {/* Calculator Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Values (comma-separated)
            </label>
            <textarea
              value={actualValues}
              onChange={(e) => setActualValues(e.target.value)}
              placeholder="e.g., 2.5, 3.0, 2.8, 3.2"
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Predicted Values (comma-separated)
            </label>
            <textarea
              value={predictedValues}
              onChange={(e) => setPredictedValues(e.target.value)}
              placeholder="e.g., 2.4, 3.1, 2.7, 3.3"
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={calculateMetric}
            className="btn-primary flex items-center space-x-2"
          >
            <Calculator className="h-4 w-4" />
            <span>Calculate</span>
          </button>
          <button
            onClick={loadExample}
            className="btn-secondary text-sm"
          >
            Load Example
          </button>
          <button
            onClick={() => {
              setActualValues('');
              setPredictedValues('');
              setMetricResult(null);
            }}
            className="btn-secondary text-sm"
          >
            Clear
          </button>
        </div>

        {/* Result */}
        {metricResult !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Result</h4>
                <p className="text-2xl font-bold text-green-700 font-mono">
                  {metricResult.toFixed(6)}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(metricResult.toFixed(6))}
                className="btn-secondary text-sm flex items-center space-x-1"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Data Science Metrics</h3>
        <div className="space-y-3 text-gray-600 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Regression Metrics:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>MSE:</strong> Penalizes large errors more (squared)</li>
                <li><strong>MAE:</strong> Average error magnitude (linear)</li>
                <li><strong>RMSE:</strong> Same units as target (interpretable)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Classification Metrics:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Accuracy:</strong> Overall correctness</li>
                <li><strong>Precision:</strong> Quality of positive predictions</li>
                <li><strong>Recall:</strong> Coverage of actual positives</li>
                <li><strong>F1 Score:</strong> Balance of precision and recall</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> For classification metrics, use binary values (0 and 1). 
              For regression metrics, use continuous numeric values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataScienceUtility;

