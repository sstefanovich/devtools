import React, { useState } from 'react';
import { Calculator, Copy, TrendingUp, BarChart3 } from 'lucide-react';

// Normal distribution CDF approximation (using error function)
const normalCDF = (x: number): number => {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
};

// Error function approximation
const erf = (x: number): number => {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};

// Inverse normal CDF (quantile function) approximation
const inverseNormalCDF = (p: number): number => {
  if (p <= 0 || p >= 1) return NaN;
  
  // Approximation using Beasley-Springer-Moro algorithm
  const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

  let q = p - 0.5;
  let r, x;

  if (Math.abs(q) <= 0.425) {
    r = 0.180625 - q * q;
    const numerator = (((((a[7] * r + a[6]) * r + a[5]) * r + a[4]) * r + a[3]) * r + a[2]) * r + a[1];
    const denominator = (((((b[6] * r + b[5]) * r + b[4]) * r + b[3]) * r + b[2]) * r + b[1]) * r + 1;
    x = q * numerator / denominator;
  } else {
    r = q < 0 ? p : 1 - p;
    r = Math.sqrt(-Math.log(r));
    if (r <= 5) {
      r = r - 1.6;
      const num = (((((c[5] * r + c[4]) * r + c[3]) * r + c[2]) * r + c[1]) * r + c[0]);
      const den = ((((d[4] * r + d[3]) * r + d[2]) * r + d[1]) * r + 1);
      x = num / den;
    } else {
      r = r - 5;
      const num = (((((c[5] * r + c[4]) * r + c[3]) * r + c[2]) * r + c[1]) * r + c[0]);
      const den = ((((d[4] * r + d[3]) * r + d[2]) * r + d[1]) * r + 1);
      x = num / den;
    }
    if (q < 0) x = -x;
  }
  return x;
};

// T-distribution critical values (approximation for common df values)
// Note: Currently unused but kept for potential future use
// const tCritical = (df: number, alpha: number, twoTailed: boolean = true): number => {
//   // Simplified approximation - for production, use proper t-distribution library
//   const z = inverseNormalCDF(1 - (twoTailed ? alpha / 2 : alpha));
//   if (df >= 30) return z;
//   
//   // Approximation for small df
//   const correction = 1 + (z * z) / (4 * df);
//   return z * correction;
// };

const StatisticalCalculatorUtility: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('z-score');

  // Z-Score Calculator
  const [zValue, setZValue] = useState<string>('');
  const [zMean, setZMean] = useState<string>('');
  const [zStdDev, setZStdDev] = useState<string>('');
  const [zScoreResult, setZScoreResult] = useState<number | null>(null);
  const [zPValue, setZPValue] = useState<number | null>(null);

  // Confidence Interval
  const [ciMean, setCiMean] = useState<string>('');
  const [ciStdDev, setCiStdDev] = useState<string>('');
  const [ciSampleSize, setCiSampleSize] = useState<string>('');
  const [ciConfidence, setCiConfidence] = useState<string>('95');
  const [ciResult, setCiResult] = useState<{ lower: number; upper: number } | null>(null);

  // T-Score Calculator
  const [tValue, setTValue] = useState<string>('');
  const [tMean, setTMean] = useState<string>('');
  const [tStdDev, setTStdDev] = useState<string>('');
  const [tSampleSize, setTSampleSize] = useState<string>('');
  const [tScoreResult, setTScoreResult] = useState<number | null>(null);
  const [tPValue, setTPValue] = useState<number | null>(null);
  const [tDf, setTDf] = useState<number | null>(null);

  // Normal Distribution
  const [normMean, setNormMean] = useState<string>('0');
  const [normStdDev, setNormStdDev] = useState<string>('1');
  const [normX, setNormX] = useState<string>('');
  const [normProbability, setNormProbability] = useState<number | null>(null);

  // Descriptive Statistics
  const [descData, setDescData] = useState<string>('');
  const [descStats, setDescStats] = useState<{
    mean: number;
    median: number;
    mode: number | null;
    stdDev: number;
    variance: number;
    min: number;
    max: number;
    q1: number;
    q3: number;
  } | null>(null);

  const calculateZScore = () => {
    try {
      const value = parseFloat(zValue);
      const mean = parseFloat(zMean);
      const stdDev = parseFloat(zStdDev);

      if (isNaN(value) || isNaN(mean) || isNaN(stdDev) || stdDev === 0) {
        setZScoreResult(null);
        setZPValue(null);
        return;
      }

      const zScore = (value - mean) / stdDev;
      setZScoreResult(zScore);
      
      // Calculate p-value (two-tailed)
      const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
      setZPValue(pValue);
    } catch {
      setZScoreResult(null);
      setZPValue(null);
    }
  };

  const calculateConfidenceInterval = () => {
    try {
      const mean = parseFloat(ciMean);
      const stdDev = parseFloat(ciStdDev);
      const sampleSize = parseFloat(ciSampleSize);
      const confidence = parseFloat(ciConfidence) / 100;

      if (isNaN(mean) || isNaN(stdDev) || isNaN(sampleSize) || sampleSize <= 0 || stdDev <= 0) {
        setCiResult(null);
        return;
      }

      const alpha = 1 - confidence;
      const zCritical = inverseNormalCDF(1 - alpha / 2);
      const marginOfError = zCritical * (stdDev / Math.sqrt(sampleSize));

      setCiResult({
        lower: mean - marginOfError,
        upper: mean + marginOfError,
      });
    } catch {
      setCiResult(null);
    }
  };

  const calculateTScore = () => {
    try {
      const value = parseFloat(tValue);
      const mean = parseFloat(tMean);
      const stdDev = parseFloat(tStdDev);
      const sampleSize = parseFloat(tSampleSize);

      if (isNaN(value) || isNaN(mean) || isNaN(stdDev) || isNaN(sampleSize) || sampleSize <= 1 || stdDev <= 0) {
        setTScoreResult(null);
        setTPValue(null);
        setTDf(null);
        return;
      }

      const df = sampleSize - 1;
      const tScore = (value - mean) / (stdDev / Math.sqrt(sampleSize));
      setTScoreResult(tScore);
      setTDf(df);

      // Approximate p-value using normal approximation for large df
      if (df >= 30) {
        const pValue = 2 * (1 - normalCDF(Math.abs(tScore)));
        setTPValue(pValue);
      } else {
        // For small df, use approximation
        const zApprox = Math.abs(tScore);
        const pValue = 2 * (1 - normalCDF(zApprox));
        setTPValue(pValue);
      }
    } catch {
      setTScoreResult(null);
      setTPValue(null);
      setTDf(null);
    }
  };

  const calculateNormalProbability = () => {
    try {
      const mean = parseFloat(normMean);
      const stdDev = parseFloat(normStdDev);
      const x = parseFloat(normX);

      if (isNaN(mean) || isNaN(stdDev) || isNaN(x) || stdDev <= 0) {
        setNormProbability(null);
        return;
      }

      const z = (x - mean) / stdDev;
      const probability = normalCDF(z);
      setNormProbability(probability);
    } catch {
      setNormProbability(null);
    }
  };

  const calculateDescriptiveStats = () => {
    try {
      const data = descData.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      
      if (data.length === 0) {
        setDescStats(null);
        return;
      }

      data.sort((a, b) => a - b);

      const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
      const stdDev = Math.sqrt(variance);

      const median = data.length % 2 === 0
        ? (data[data.length / 2 - 1] + data[data.length / 2]) / 2
        : data[Math.floor(data.length / 2)];

      const q1Index = Math.floor(data.length * 0.25);
      const q3Index = Math.floor(data.length * 0.75);
      const q1 = data[q1Index];
      const q3 = data[q3Index];

      // Mode (most frequent value)
      const frequency: Record<number, number> = {};
      data.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(frequency));
      const modeValues = Object.keys(frequency).filter(key => frequency[parseFloat(key)] === maxFreq);
      const mode = modeValues.length === 1 ? parseFloat(modeValues[0]) : null;

      setDescStats({
        mean,
        median,
        mode,
        stdDev,
        variance,
        min: data[0],
        max: data[data.length - 1],
        q1,
        q3,
      });
    } catch {
      setDescStats(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const tabs = [
    { id: 'z-score', label: 'Z-Score', icon: TrendingUp },
    { id: 't-score', label: 'T-Score', icon: BarChart3 },
    { id: 'confidence', label: 'Confidence Interval', icon: Calculator },
    { id: 'normal', label: 'Normal Distribution', icon: BarChart3 },
    { id: 'descriptive', label: 'Descriptive Stats', icon: Calculator },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Calculator className="h-8 w-8 text-violet-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Statistical Calculator</h1>
        </div>
        <p className="text-gray-600">
          Calculate z-scores, t-scores, confidence intervals, and more
        </p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Z-Score Calculator */}
        {activeTab === 'z-score' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Z-Score Calculator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Calculate the z-score (standard score) which indicates how many standard deviations a value is from the mean.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value (x)</label>
                <input
                  type="number"
                  value={zValue}
                  onChange={(e) => setZValue(e.target.value)}
                  placeholder="Enter value"
                  className="input-field"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mean (μ)</label>
                <input
                  type="number"
                  value={zMean}
                  onChange={(e) => setZMean(e.target.value)}
                  placeholder="Enter mean"
                  className="input-field"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Deviation (σ)</label>
                <input
                  type="number"
                  value={zStdDev}
                  onChange={(e) => setZStdDev(e.target.value)}
                  placeholder="Enter std dev"
                  className="input-field"
                  step="any"
                />
              </div>
            </div>

            <button onClick={calculateZScore} className="btn-primary">
              Calculate Z-Score
            </button>

            {zScoreResult !== null && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Z-Score</h4>
                    <p className="text-2xl font-bold text-green-700 font-mono">{zScoreResult.toFixed(6)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(zScoreResult.toFixed(6))}
                    className="btn-secondary text-sm flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
                {zPValue !== null && (
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-sm text-green-700">
                      <strong>P-value (two-tailed):</strong> {zPValue.toFixed(6)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Interpretation: {zPValue < 0.05 ? 'Statistically significant (p &lt; 0.05)' : 'Not statistically significant (p ≥ 0.05)'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Formula:</strong> z = (x - μ) / σ
              </p>
            </div>
          </div>
        )}

        {/* T-Score Calculator */}
        {activeTab === 't-score' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">T-Score Calculator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Calculate the t-score for hypothesis testing with small sample sizes (typically n &lt; 30).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Mean (x̄)</label>
                <input
                  type="number"
                  value={tValue}
                  onChange={(e) => setTValue(e.target.value)}
                  placeholder="Enter sample mean"
                  className="input-field"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Population Mean (μ)</label>
                <input
                  type="number"
                  value={tMean}
                  onChange={(e) => setTMean(e.target.value)}
                  placeholder="Enter population mean"
                  className="input-field"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Standard Deviation (s)</label>
                <input
                  type="number"
                  value={tStdDev}
                  onChange={(e) => setTStdDev(e.target.value)}
                  placeholder="Enter sample std dev"
                  className="input-field"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Size (n)</label>
                <input
                  type="number"
                  value={tSampleSize}
                  onChange={(e) => setTSampleSize(e.target.value)}
                  placeholder="Enter sample size"
                  className="input-field"
                  step="1"
                />
              </div>
            </div>

            <button onClick={calculateTScore} className="btn-primary">
              Calculate T-Score
            </button>

            {tScoreResult !== null && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">T-Score</h4>
                    <p className="text-2xl font-bold text-green-700 font-mono">{tScoreResult.toFixed(6)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(tScoreResult.toFixed(6))}
                    className="btn-secondary text-sm flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
                {tDf !== null && (
                  <p className="text-sm text-green-700">
                    <strong>Degrees of Freedom:</strong> {tDf}
                  </p>
                )}
                {tPValue !== null && (
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-sm text-green-700">
                      <strong>P-value (two-tailed, approximate):</strong> {tPValue.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Formula:</strong> t = (x̄ - μ) / (s / √n)
              </p>
            </div>
          </div>
        )}

        {/* Confidence Interval */}
        {activeTab === 'confidence' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Interval Calculator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Calculate a confidence interval for a population mean using sample data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Mean (x̄)</label>
                <input
                  type="number"
                  value={ciMean}
                  onChange={(e) => setCiMean(e.target.value)}
                  placeholder="Enter sample mean"
                  className="input-field"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Deviation (σ)</label>
                <input
                  type="number"
                  value={ciStdDev}
                  onChange={(e) => setCiStdDev(e.target.value)}
                  placeholder="Enter std dev"
                  className="input-field"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Size (n)</label>
                <input
                  type="number"
                  value={ciSampleSize}
                  onChange={(e) => setCiSampleSize(e.target.value)}
                  placeholder="Enter sample size"
                  className="input-field"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Level (%)</label>
                <select
                  value={ciConfidence}
                  onChange={(e) => setCiConfidence(e.target.value)}
                  className="input-field"
                >
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
              </div>
            </div>

            <button onClick={calculateConfidenceInterval} className="btn-primary">
              Calculate Confidence Interval
            </button>

            {ciResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  {ciConfidence}% Confidence Interval
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Lower bound:</span>
                    <span className="font-mono font-bold text-green-900">{ciResult.lower.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Upper bound:</span>
                    <span className="font-mono font-bold text-green-900">{ciResult.upper.toFixed(6)}</span>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-sm text-green-700">
                      Range: [{ciResult.lower.toFixed(4)}, {ciResult.upper.toFixed(4)}]
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Formula:</strong> CI = x̄ ± z<sub>α/2</sub> × (σ / √n)
              </p>
            </div>
          </div>
        )}

        {/* Normal Distribution */}
        {activeTab === 'normal' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Normal Distribution Calculator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Calculate the probability that a value from a normal distribution is less than or equal to x.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mean (μ)</label>
                <input
                  type="number"
                  value={normMean}
                  onChange={(e) => setNormMean(e.target.value)}
                  placeholder="0"
                  className="input-field"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Deviation (σ)</label>
                <input
                  type="number"
                  value={normStdDev}
                  onChange={(e) => setNormStdDev(e.target.value)}
                  placeholder="1"
                  className="input-field"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value (x)</label>
                <input
                  type="number"
                  value={normX}
                  onChange={(e) => setNormX(e.target.value)}
                  placeholder="Enter x"
                  className="input-field"
                  step="any"
                />
              </div>
            </div>

            <button onClick={calculateNormalProbability} className="btn-primary">
              Calculate Probability
            </button>

            {normProbability !== null && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">P(X ≤ x)</h4>
                    <p className="text-2xl font-bold text-green-700 font-mono">{(normProbability * 100).toFixed(4)}%</p>
                    <p className="text-sm text-green-600 mt-1">Probability: {normProbability.toFixed(6)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(normProbability.toFixed(6))}
                    className="btn-secondary text-sm flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Calculates P(X ≤ x) for a normal distribution with given mean and standard deviation.
              </p>
            </div>
          </div>
        )}

        {/* Descriptive Statistics */}
        {activeTab === 'descriptive' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Descriptive Statistics</h3>
              <p className="text-sm text-gray-600 mb-4">
                Calculate mean, median, mode, standard deviation, and quartiles from a dataset.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data (comma-separated values)
              </label>
              <textarea
                value={descData}
                onChange={(e) => setDescData(e.target.value)}
                placeholder="e.g., 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            <button onClick={calculateDescriptiveStats} className="btn-primary">
              Calculate Statistics
            </button>

            {descStats && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-4">Descriptive Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-green-600 mb-1">Mean</p>
                    <p className="font-mono font-bold text-green-900">{descStats.mean.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Median</p>
                    <p className="font-mono font-bold text-green-900">{descStats.median.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Mode</p>
                    <p className="font-mono font-bold text-green-900">
                      {descStats.mode !== null ? descStats.mode.toFixed(4) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Std Deviation</p>
                    <p className="font-mono font-bold text-green-900">{descStats.stdDev.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Variance</p>
                    <p className="font-mono font-bold text-green-900">{descStats.variance.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Min</p>
                    <p className="font-mono font-bold text-green-900">{descStats.min.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Max</p>
                    <p className="font-mono font-bold text-green-900">{descStats.max.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Q1</p>
                    <p className="font-mono font-bold text-green-900">{descStats.q1.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Q3</p>
                    <p className="font-mono font-bold text-green-900">{descStats.q3.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Statistical Calculations</h3>
        <div className="space-y-3 text-gray-600 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Z-Score vs T-Score:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Z-Score:</strong> Use when population standard deviation is known</li>
                <li><strong>T-Score:</strong> Use for small samples (n &lt; 30) or unknown population std dev</li>
                <li>Both measure how many standard deviations a value is from the mean</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Confidence Intervals:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>95% confidence: 95% of intervals contain the true population mean</li>
                <li>Wider intervals = more confidence, less precision</li>
                <li>Larger sample sizes = narrower intervals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticalCalculatorUtility;

