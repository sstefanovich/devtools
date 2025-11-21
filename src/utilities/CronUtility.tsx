import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Copy, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface CronFields {
  second?: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

interface ParsedCron {
  isValid: boolean;
  error?: string;
  description?: string;
  nextRuns?: Date[];
  format?: '5-field' | '6-field';
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseCronField = (field: string, min: number, max: number): number[] => {
  if (field === '*') {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }

  const values: number[] = [];
  const parts = field.split(',');

  for (const part of parts) {
    if (part.includes('/')) {
      // Step values: */5, 0-10/2
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      
      if (isNaN(step) || step <= 0) {
        throw new Error(`Invalid step value: ${stepStr}`);
      }

      if (range === '*') {
        for (let i = min; i <= max; i += step) {
          values.push(i);
        }
      } else if (range.includes('-')) {
        const [startStr, endStr] = range.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        
        if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
          throw new Error(`Invalid range: ${range}`);
        }

        for (let i = start; i <= end; i += step) {
          values.push(i);
        }
      } else {
        const value = parseInt(range, 10);
        if (isNaN(value) || value < min || value > max) {
          throw new Error(`Invalid value: ${range}`);
        }
        values.push(value);
      }
    } else if (part.includes('-')) {
      // Range: 1-5
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
        throw new Error(`Invalid range: ${part}`);
      }

      for (let i = start; i <= end; i++) {
        values.push(i);
      }
    } else {
      // Single value
      const value = parseInt(part, 10);
      if (isNaN(value) || value < min || value > max) {
        throw new Error(`Invalid value: ${part}`);
      }
      values.push(value);
    }
  }

  return [...new Set(values)].sort((a, b) => a - b);
};

const parseCronExpression = (cron: string): ParsedCron => {
  const trimmed = cron.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'CRON expression cannot be empty' };
  }

  const parts = trimmed.split(/\s+/);
  
  if (parts.length !== 5 && parts.length !== 6) {
    return { isValid: false, error: 'CRON expression must have exactly 5 fields (standard) or 6 fields (Azure Functions/NCRONTAB)' };
  }

  const is6Field = parts.length === 6;

  try {
    if (is6Field) {
      // 6-field format: second minute hour day-of-month month day-of-week (Azure Functions/NCRONTAB)
      const [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      
      const seconds = parseCronField(second, 0, 59);
      const minutes = parseCronField(minute, 0, 59);
      const hours = parseCronField(hour, 0, 23);
      const daysOfMonth = parseCronField(dayOfMonth, 1, 31);
      const months = parseCronField(month, 1, 12);
      const daysOfWeek = parseCronField(dayOfWeek, 0, 7);

      // Convert day of week 7 to 0 (both represent Sunday)
      const normalizedDaysOfWeek = daysOfWeek.map(d => d === 7 ? 0 : d);

      // Build human-readable description
      const description = buildDescription(seconds, minutes, hours, daysOfMonth, months, normalizedDaysOfWeek);

      // Calculate next 5 execution times
      const nextRuns = calculateNextRuns(seconds, minutes, hours, daysOfMonth, months, normalizedDaysOfWeek, 5);

      return {
        isValid: true,
        description,
        nextRuns,
        format: '6-field',
      };
    } else {
      // 5-field format: minute hour day-of-month month day-of-week (standard)
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      
      const minutes = parseCronField(minute, 0, 59);
      const hours = parseCronField(hour, 0, 23);
      const daysOfMonth = parseCronField(dayOfMonth, 1, 31);
      const months = parseCronField(month, 1, 12);
      const daysOfWeek = parseCronField(dayOfWeek, 0, 7);

      // Convert day of week 7 to 0 (both represent Sunday)
      const normalizedDaysOfWeek = daysOfWeek.map(d => d === 7 ? 0 : d);

      // For 5-field format, seconds default to 0
      const seconds = [0];

      // Build human-readable description
      const description = buildDescription(seconds, minutes, hours, daysOfMonth, months, normalizedDaysOfWeek);

      // Calculate next 5 execution times
      const nextRuns = calculateNextRuns(seconds, minutes, hours, daysOfMonth, months, normalizedDaysOfWeek, 5);

      return {
        isValid: true,
        description,
        nextRuns,
        format: '5-field',
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid CRON expression',
    };
  }
};

const buildDescription = (
  seconds: number[],
  minutes: number[],
  hours: number[],
  daysOfMonth: number[],
  months: number[],
  daysOfWeek: number[]
): string => {
  const parts: string[] = [];

  // Second (only include if not just [0] for 5-field format)
  if (seconds.length === 60) {
    parts.push('every second');
  } else if (seconds.length > 1 || (seconds.length === 1 && seconds[0] !== 0)) {
    if (seconds.length === 1) {
      parts.push(`at second ${seconds[0]}`);
    } else if (seconds.length <= 5) {
      parts.push(`at seconds ${seconds.join(', ')}`);
    } else {
      parts.push(`at ${seconds.length} different seconds`);
    }
  }

  // Minute
  if (minutes.length === 60) {
    parts.push('every minute');
  } else if (minutes.length === 1) {
    parts.push(`at minute ${minutes[0]}`);
  } else if (minutes.length <= 5) {
    parts.push(`at minutes ${minutes.join(', ')}`);
  } else {
    parts.push(`at ${minutes.length} different minutes`);
  }

  // Hour
  if (hours.length === 24) {
    parts.push('of every hour');
  } else if (hours.length === 1) {
    parts.push(`of hour ${hours[0]}`);
  } else if (hours.length <= 5) {
    parts.push(`of hours ${hours.join(', ')}`);
  } else {
    parts.push(`of ${hours.length} different hours`);
  }

  // Day of month
  if (daysOfMonth.length === 31) {
    parts.push('on every day');
  } else if (daysOfMonth.length === 1) {
    parts.push(`on day ${daysOfMonth[0]} of the month`);
  } else if (daysOfMonth.length <= 5) {
    parts.push(`on days ${daysOfMonth.join(', ')} of the month`);
  } else {
    parts.push(`on ${daysOfMonth.length} different days of the month`);
  }

  // Month
  if (months.length === 12) {
    parts.push('of every month');
  } else if (months.length === 1) {
    parts.push(`in ${MONTH_NAMES[months[0] - 1]}`);
  } else if (months.length <= 5) {
    parts.push(`in ${months.map(m => MONTH_NAMES[m - 1]).join(', ')}`);
  } else {
    parts.push(`in ${months.length} different months`);
  }

  // Day of week
  if (daysOfWeek.length === 7) {
    parts.push('on every day of the week');
  } else if (daysOfWeek.length === 1) {
    parts.push(`on ${DAY_NAMES[daysOfWeek[0]]}`);
  } else if (daysOfWeek.length <= 5) {
    parts.push(`on ${daysOfWeek.map(d => DAY_NAMES[d]).join(', ')}`);
  } else {
    parts.push(`on ${daysOfWeek.length} different days of the week`);
  }

  return parts.join(' ');
};

const calculateNextRuns = (
  seconds: number[],
  minutes: number[],
  hours: number[],
  daysOfMonth: number[],
  months: number[],
  daysOfWeek: number[],
  count: number
): Date[] => {
  const results: Date[] = [];
  const now = new Date();
  let current = new Date(now);
  current.setMilliseconds(0);

  // If current second is not in the list, move to next second
  if (!seconds.includes(current.getSeconds())) {
    current.setSeconds(current.getSeconds() + 1);
  }

  let attempts = 0;
  const maxAttempts = 100000; // Prevent infinite loops (increased for second-level precision)

  while (results.length < count && attempts < maxAttempts) {
    attempts++;

    // Check if current time matches all conditions
    const currentSecond = current.getSeconds();
    const currentMinute = current.getMinutes();
    const currentHour = current.getHours();
    const currentDayOfMonth = current.getDate();
    const currentMonth = current.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDayOfWeek = current.getDay();

    if (
      seconds.includes(currentSecond) &&
      minutes.includes(currentMinute) &&
      hours.includes(currentHour) &&
      daysOfMonth.includes(currentDayOfMonth) &&
      months.includes(currentMonth) &&
      daysOfWeek.includes(currentDayOfWeek)
    ) {
      results.push(new Date(current));
    }

    // Move to next second
    current.setSeconds(current.getSeconds() + 1);
  }

  return results;
};

const CronUtility: React.FC = () => {
  const [mode, setMode] = useState<'parser' | 'builder'>('parser');
  const [cronFormat, setCronFormat] = useState<'5-field' | '6-field'>('5-field');
  const [cronExpression, setCronExpression] = useState('0 0 * * *');
  const [builderFields, setBuilderFields] = useState<CronFields>({
    second: '0',
    minute: '0',
    hour: '0',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  });

  const parsedCron = useMemo(() => {
    if (mode === 'parser') {
      return parseCronExpression(cronExpression);
    } else {
      let builtCron: string;
      if (cronFormat === '6-field') {
        builtCron = `${builderFields.second || '0'} ${builderFields.minute} ${builderFields.hour} ${builderFields.dayOfMonth} ${builderFields.month} ${builderFields.dayOfWeek}`;
      } else {
        builtCron = `${builderFields.minute} ${builderFields.hour} ${builderFields.dayOfMonth} ${builderFields.month} ${builderFields.dayOfWeek}`;
      }
      return parseCronExpression(builtCron);
    }
  }, [mode, cronExpression, builderFields, cronFormat]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const handleBuilderFieldChange = (field: keyof CronFields, value: string) => {
    setBuilderFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getBuiltCronExpression = (): string => {
    if (cronFormat === '6-field') {
      return `${builderFields.second || '0'} ${builderFields.minute} ${builderFields.hour} ${builderFields.dayOfMonth} ${builderFields.month} ${builderFields.dayOfWeek}`;
    } else {
      return `${builderFields.minute} ${builderFields.hour} ${builderFields.dayOfMonth} ${builderFields.month} ${builderFields.dayOfWeek}`;
    }
  };

  // Ensure second field is set when switching to 6-field format
  useEffect(() => {
    if (mode === 'builder' && cronFormat === '6-field' && !builderFields.second) {
      setBuilderFields((prev) => ({ ...prev, second: '0' }));
    }
  }, [mode, cronFormat]);

  const loadPreset = (preset: string) => {
    const presets5Field: Record<string, CronFields> = {
      'every-minute': { minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
      'every-hour': { minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
      'daily': { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
      'weekly': { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '0' },
      'monthly': { minute: '0', hour: '0', dayOfMonth: '1', month: '*', dayOfWeek: '*' },
      'yearly': { minute: '0', hour: '0', dayOfMonth: '1', month: '1', dayOfWeek: '*' },
      'weekdays': { minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' },
    };

    const presets6Field: Record<string, CronFields> = {
      'every-minute': { second: '0', minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
      'every-hour': { second: '0', minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
      'daily': { second: '0', minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
      'weekly': { second: '0', minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '0' },
      'monthly': { second: '0', minute: '0', hour: '0', dayOfMonth: '1', month: '*', dayOfWeek: '*' },
      'yearly': { second: '0', minute: '0', hour: '0', dayOfMonth: '1', month: '1', dayOfWeek: '*' },
      'weekdays': { second: '0', minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' },
    };

    const presets = cronFormat === '6-field' ? presets6Field : presets5Field;
    if (presets[preset]) {
      setBuilderFields(presets[preset]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-cyan-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">CRON Parser & Builder</h1>
        </div>
        <p className="text-gray-600">
          Parse CRON expressions to understand their schedule, or build new expressions with a visual interface
        </p>
      </div>

      {/* Mode Selection */}
      <div className="card">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setMode('parser')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'parser'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Parser
          </button>
          <button
            onClick={() => setMode('builder')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'builder'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Builder
          </button>
        </div>

        {/* Parser Mode */}
        {mode === 'parser' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CRON Expression
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="e.g., 0 0 * * * or 0 0 0 * * *"
                  className="input-field font-mono text-lg"
                />
                <button
                  onClick={() => handleCopy(cronExpression)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                  title="Copy CRON expression"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supports both 5-field (standard) and 6-field (Azure Functions/NCRONTAB) formats
              </p>
              {parsedCron.isValid && parsedCron.format && (
                <p className="text-xs text-cyan-600 mt-1 font-medium">
                  Detected format: {parsedCron.format === '6-field' ? '6-field (Azure Functions/NCRONTAB)' : '5-field (Standard)'}
                </p>
              )}
            </div>

            {/* Validation Result */}
            {parsedCron.isValid ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-900 mb-1">Valid CRON Expression</h3>
                    <p className="text-green-700 text-sm">{parsedCron.description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">Invalid CRON Expression</h3>
                    <p className="text-red-700 text-sm">{parsedCron.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Execution Times */}
            {parsedCron.isValid && parsedCron.nextRuns && parsedCron.nextRuns.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Next Execution Times</h3>
                <div className="space-y-2">
                  {parsedCron.nextRuns.map((date, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-mono text-sm text-gray-900">{formatDate(date)}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(formatDate(date))}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Copy date"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Builder Mode */}
        {mode === 'builder' && (
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CRON Format
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCronFormat('5-field')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    cronFormat === '5-field'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  5-Field (Standard)
                </button>
                <button
                  onClick={() => setCronFormat('6-field')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    cronFormat === '6-field'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  6-Field (Azure Functions)
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {cronFormat === '6-field' 
                  ? 'Format: second minute hour day-of-month month day-of-week (NCRONTAB)' 
                  : 'Format: minute hour day-of-month month day-of-week (Standard)'}
              </p>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => loadPreset('every-minute')}
                  className="btn-secondary text-xs"
                >
                  Every Minute
                </button>
                <button
                  onClick={() => loadPreset('every-hour')}
                  className="btn-secondary text-xs"
                >
                  Every Hour
                </button>
                <button
                  onClick={() => loadPreset('daily')}
                  className="btn-secondary text-xs"
                >
                  Daily
                </button>
                <button
                  onClick={() => loadPreset('weekly')}
                  className="btn-secondary text-xs"
                >
                  Weekly
                </button>
                <button
                  onClick={() => loadPreset('monthly')}
                  className="btn-secondary text-xs"
                >
                  Monthly
                </button>
                <button
                  onClick={() => loadPreset('yearly')}
                  className="btn-secondary text-xs"
                >
                  Yearly
                </button>
                <button
                  onClick={() => loadPreset('weekdays')}
                  className="btn-secondary text-xs"
                >
                  Weekdays 9 AM
                </button>
              </div>
            </div>

            {/* Builder Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cronFormat === '6-field' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Second (0-59)
                  </label>
                  <input
                    type="text"
                    value={builderFields.second || '0'}
                    onChange={(e) => handleBuilderFieldChange('second', e.target.value)}
                    placeholder="0 or * or */5 or 0-30/5"
                    className="input-field font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Examples: 0, *, */5, 0-30/5, 0,15,30,45</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minute (0-59)
                </label>
                <input
                  type="text"
                  value={builderFields.minute}
                  onChange={(e) => handleBuilderFieldChange('minute', e.target.value)}
                  placeholder="0 or * or */5 or 0-30/5"
                  className="input-field font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Examples: 0, *, */5, 0-30/5, 0,15,30,45</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hour (0-23)
                </label>
                <input
                  type="text"
                  value={builderFields.hour}
                  onChange={(e) => handleBuilderFieldChange('hour', e.target.value)}
                  placeholder="0 or * or 9-17 or 0,12"
                  className="input-field font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Examples: 0, *, 9-17, 0,12</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day of Month (1-31)
                </label>
                <input
                  type="text"
                  value={builderFields.dayOfMonth}
                  onChange={(e) => handleBuilderFieldChange('dayOfMonth', e.target.value)}
                  placeholder="* or 1 or 1,15 or 1-10"
                  className="input-field font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Examples: *, 1, 1,15, 1-10</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month (1-12)
                </label>
                <input
                  type="text"
                  value={builderFields.month}
                  onChange={(e) => handleBuilderFieldChange('month', e.target.value)}
                  placeholder="* or 1 or 1-6 or 1,6,12"
                  className="input-field font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Examples: *, 1, 1-6, 1,6,12</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day of Week (0-7, 0 and 7 = Sunday)
                </label>
                <input
                  type="text"
                  value={builderFields.dayOfWeek}
                  onChange={(e) => handleBuilderFieldChange('dayOfWeek', e.target.value)}
                  placeholder="* or 0 or 1-5 or 0,6"
                  className="input-field font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Examples: *, 0, 1-5 (Mon-Fri), 0,6 (Weekends)</p>
              </div>
            </div>

            {/* Generated CRON Expression */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated CRON Expression
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={getBuiltCronExpression()}
                  readOnly
                  className="input-field bg-gray-50 font-mono text-lg"
                />
                <button
                  onClick={() => handleCopy(getBuiltCronExpression())}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                  title="Copy CRON expression"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Validation Result */}
            {parsedCron.isValid ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-900 mb-1">Valid CRON Expression</h3>
                    <p className="text-green-700 text-sm">{parsedCron.description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">Invalid CRON Expression</h3>
                    <p className="text-red-700 text-sm">{parsedCron.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Execution Times */}
            {parsedCron.isValid && parsedCron.nextRuns && parsedCron.nextRuns.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Next Execution Times</h3>
                <div className="space-y-2">
                  {parsedCron.nextRuns.map((date, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-mono text-sm text-gray-900">{formatDate(date)}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(formatDate(date))}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Copy date"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About CRON Expressions</h3>
        <div className="space-y-3 text-gray-600 text-sm">
          <p>
            A CRON expression is a string representing a schedule for recurring tasks. There are two common formats:
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">5-Field Format (Standard)</h4>
            <p className="text-blue-800 mb-2">Used by most CRON implementations (Linux cron, etc.)</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700">
              <li><strong>Minute (0-59):</strong> The minute of the hour</li>
              <li><strong>Hour (0-23):</strong> The hour of the day (24-hour format)</li>
              <li><strong>Day of Month (1-31):</strong> The day of the month</li>
              <li><strong>Month (1-12):</strong> The month of the year</li>
              <li><strong>Day of Week (0-7):</strong> The day of the week (0 and 7 = Sunday)</li>
            </ul>
          </div>

          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-900 mb-2">6-Field Format (Azure Functions/NCRONTAB)</h4>
            <p className="text-cyan-800 mb-2">Used by Azure Functions and NCRONTAB implementations</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-cyan-700">
              <li><strong>Second (0-59):</strong> The second of the minute</li>
              <li><strong>Minute (0-59):</strong> The minute of the hour</li>
              <li><strong>Hour (0-23):</strong> The hour of the day (24-hour format)</li>
              <li><strong>Day of Month (1-31):</strong> The day of the month</li>
              <li><strong>Month (1-12):</strong> The month of the year</li>
              <li><strong>Day of Week (0-7):</strong> The day of the week (0 and 7 = Sunday)</li>
            </ul>
          </div>

          <p>
            <strong>Special characters:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>*</strong> - Matches any value</li>
            <li><strong>,</strong> - Separates multiple values (e.g., 1,3,5)</li>
            <li><strong>-</strong> - Defines a range (e.g., 1-5)</li>
            <li><strong>/</strong> - Defines a step (e.g., */5 means every 5 minutes)</li>
          </ul>
          <p>
            <strong>Common examples (5-field):</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-xs">
            <li><strong>0 0 * * *</strong> - Every day at midnight</li>
            <li><strong>0 */6 * * *</strong> - Every 6 hours</li>
            <li><strong>0 9 * * 1-5</strong> - Every weekday at 9 AM</li>
            <li><strong>0 0 1 * *</strong> - First day of every month at midnight</li>
            <li><strong>*/15 * * * *</strong> - Every 15 minutes</li>
          </ul>
          <p>
            <strong>Common examples (6-field):</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-xs">
            <li><strong>0 0 0 * * *</strong> - Every day at midnight</li>
            <li><strong>0 0 */6 * * *</strong> - Every 6 hours</li>
            <li><strong>0 0 9 * * 1-5</strong> - Every weekday at 9 AM</li>
            <li><strong>0 0 0 1 * *</strong> - First day of every month at midnight</li>
            <li><strong>0 */15 * * * *</strong> - Every 15 minutes</li>
            <li><strong>*/30 * * * * *</strong> - Every 30 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CronUtility;

