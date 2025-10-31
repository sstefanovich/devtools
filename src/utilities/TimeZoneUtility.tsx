import React, { useMemo, useState } from 'react';
import { Clock, Copy, Globe, Plus, X } from 'lucide-react';

interface TimeZoneOption {
  value: string;
  label: string;
}

interface ZoneDisplayData {
  zone: string;
  label: string;
  formatted: string;
  offsetLabel: string;
  differenceLabel: string;
}

const TIMEZONE_OPTIONS: TimeZoneOption[] = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Etc/UTC', label: 'Etc/UTC' },
  { value: 'America/New_York', label: 'America/New_York (US Eastern)' },
  { value: 'America/Chicago', label: 'America/Chicago (US Central)' },
  { value: 'America/Denver', label: 'America/Denver (US Mountain)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (US Pacific)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (Brazil)' },
  { value: 'Europe/London', label: 'Europe/London (UK)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (Central Europe)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (France)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (Spain)' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow (Russia)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (South Africa)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (Gulf Standard)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (India)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Japan)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (China)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (New Zealand)' },
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (Hawaii)' },
];

const formatDateTimeInputValue = (date: Date): string => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getOffsetLabel = (referenceDate: Date, timeZone: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'shortOffset',
    });

    const parts = formatter.formatToParts(referenceDate);
    const offset = parts.find((part) => part.type === 'timeZoneName')?.value;

    if (offset) {
      return offset.replace('UTC', 'GMT');
    }
  } catch (error) {
    console.warn('Unable to resolve time zone offset label', error);
  }

  try {
    const fallbackFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });

    const formatted = fallbackFormatter.format(referenceDate);
    const match = formatted.match(/GMT[+-]\d{1,2}(?::\d{2})?/);
    if (match) {
      return match[0];
    }
  } catch (error) {
    console.warn('Unable to infer fallback offset label', error);
  }

  return 'Offset unavailable';
};

const parseOffsetMinutes = (offsetLabel: string): number | null => {
  const match = offsetLabel.match(/GMT([+-]\d{1,2})(?::?(\d{2}))?/);
  if (!match) {
    return null;
  }

  const hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const sign = hours >= 0 ? 1 : -1;
  const totalMinutes = Math.abs(hours) * 60 + minutes;

  return totalMinutes * sign;
};

const formatDifferenceLabel = (differenceMinutes: number | null): string => {
  if (differenceMinutes === null) {
    return '—';
  }

  if (differenceMinutes === 0) {
    return 'Same as local';
  }

  const sign = differenceMinutes > 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(differenceMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  const parts: string[] = [];
  if (hours) {
    parts.push(`${hours}h`);
  }
  if (minutes) {
    parts.push(`${minutes}m`);
  }

  return `${sign}${parts.join(' ')}`;
};

const formatInTimeZone = (date: Date, timeZone: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    }).format(date);
  } catch {
    return 'Invalid time zone';
  }
};

const resolveLabel = (zone: string): string =>
  TIMEZONE_OPTIONS.find((option) => option.value === zone)?.label ?? zone;

const TimeZoneUtility: React.FC = () => {
  const [dateTime, setDateTime] = useState(() => formatDateTimeInputValue(new Date()));
  const [selectedZones, setSelectedZones] = useState<string[]>([
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney',
  ]);
  const [zoneToAdd, setZoneToAdd] = useState('');

  const referenceDate = useMemo(
    () => (dateTime ? new Date(dateTime) : new Date()),
    [dateTime]
  );

  const localTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const localOffsetMinutes = useMemo(
    () => -referenceDate.getTimezoneOffset(),
    [referenceDate]
  );

  const zoneData: ZoneDisplayData[] = useMemo(() => {
    return selectedZones.map((zone) => {
      const formatted = formatInTimeZone(referenceDate, zone);
      const offsetLabel = getOffsetLabel(referenceDate, zone);
      const offsetMinutes = parseOffsetMinutes(offsetLabel);
      const differenceLabel = formatDifferenceLabel(
        offsetMinutes === null ? null : offsetMinutes - localOffsetMinutes
      );

      return {
        zone,
        label: resolveLabel(zone),
        formatted,
        offsetLabel,
        differenceLabel,
      };
    });
  }, [referenceDate, selectedZones, localOffsetMinutes]);

  const availableZones = useMemo(
    () => TIMEZONE_OPTIONS.filter((option) => !selectedZones.includes(option.value)),
    [selectedZones]
  );

  const handleAddZone = () => {
    if (!zoneToAdd) {
      return;
    }

    setSelectedZones((prev) => (prev.includes(zoneToAdd) ? prev : [...prev, zoneToAdd]));
    setZoneToAdd('');
  };

  const handleRemoveZone = (zone: string) => {
    setSelectedZones((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item !== zone)));
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy text', error);
    }
  };

  const setToNow = () => {
    setDateTime(formatDateTimeInputValue(new Date()));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Globe className="h-8 w-8 text-emerald-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Time Zone Converter</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          View the same moment across multiple time zones, compare offsets, and copy formatted timestamps for quick sharing.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="card space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Reference date &amp; time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(event) => setDateTime(event.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500">
              The above value is interpreted in your current system time zone `{localTimeZone}`.
            </p>
            <button
              type="button"
              onClick={setToNow}
              className="btn-secondary mt-2"
            >
              <Clock className="inline h-4 w-4 mr-2" />
              Set to current time
            </button>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-700">Displayed time zones</span>
            <div className="flex flex-wrap gap-2">
              {zoneData.map((zone) => (
                <span
                  key={zone.zone}
                  className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-medium"
                >
                  <span>{zone.zone}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveZone(zone.zone)}
                    className="text-emerald-600 hover:text-emerald-800"
                    title="Remove time zone"
                    aria-label={`Remove ${zone.zone}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={zoneToAdd}
                onChange={(event) => setZoneToAdd(event.target.value)}
                className="input-field"
              >
                <option value="">Select a time zone…</option>
                {availableZones.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddZone}
                className="btn-primary whitespace-nowrap"
                disabled={!zoneToAdd}
              >
                <Plus className="inline h-4 w-4 mr-2" />
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Remove a chip to hide a time zone. At least one zone must remain selected.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="card xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Converted times</h2>
              <p className="text-sm text-gray-600">
                Base time: {formatInTimeZone(referenceDate, localTimeZone)} ({getOffsetLabel(referenceDate, localTimeZone)})
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time zone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local date &amp; time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offset</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Δ vs local</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zoneData.map((zone) => (
                  <tr key={zone.zone}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{zone.label}</div>
                      <div className="text-xs text-gray-500 font-mono">{zone.zone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{zone.formatted}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{zone.offsetLabel}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{zone.differenceLabel}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy(`${zone.label}: ${zone.formatted}`)}
                        className="inline-flex items-center space-x-1 text-sm text-emerald-600 hover:text-emerald-800"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Tips for accurate conversions</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
          <li>Daylight saving transitions can shift offsets by one hour. Re-run conversions near DST boundaries.</li>
          <li>Need a zone that is not listed? Start typing the IANA identifier (e.g. <span className="font-mono">America/Toronto</span>) and add it.</li>
          <li>The reference date-time reflects your system locale. Adjust accordingly if you are planning events for another region.</li>
          <li>Consider sharing converted timestamps in UTC to avoid ambiguity.</li>
        </ul>
      </div>
    </div>
  );
};

export default TimeZoneUtility;


