import React from 'react';
import { TimeSettings } from '../types/layout';
import { LayoutMetadata } from '../hooks/useLayout';

interface TimeControlsProps {
  timeSettings: TimeSettings;
  onTimeChange: (settings: TimeSettings) => void;
  layoutMetadata?: LayoutMetadata | null;
}

const TimeControls: React.FC<TimeControlsProps> = ({ timeSettings, onTimeChange, layoutMetadata }) => {
  const handleHoursChange = (hours: number) => {
    onTimeChange({ ...timeSettings, hours });
  };

  const handleMinutesChange = (minutes: number) => {
    onTimeChange({ ...timeSettings, minutes });
  };

  const handleCurrentTimeToggle = (useCurrentTime: boolean) => {
    onTimeChange({ ...timeSettings, useCurrentTime });
  };

  // Generate hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minute options based on layout capabilities
  const isIndividualMinutes = layoutMetadata?.minuteGranularity === 'individual';
  const minuteOptions = isIndividualMinutes 
    ? Array.from({ length: 60 }, (_, i) => i) // 0-59 for individual minutes
    : Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10... for 5-minute intervals
  
  const minuteLabel = isIndividualMinutes ? "Minutes (individual)" : "Minutes (5-minute intervals)";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Settings</h3>
      
      <div className="space-y-4">
        {/* Current Time Toggle */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={timeSettings.useCurrentTime}
              onChange={(e) => handleCurrentTimeToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Use Current Time
            </span>
          </label>
        </div>

        {/* Manual Time Controls */}
        <div className={`space-y-3 ${timeSettings.useCurrentTime ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours (24-hour format)
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleHoursChange(Math.max(0, timeSettings.hours - 1))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
                disabled={timeSettings.useCurrentTime}
              >
                -
              </button>
              <select
                value={timeSettings.hours}
                onChange={(e) => handleHoursChange(parseInt(e.target.value))}
                disabled={timeSettings.useCurrentTime}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {hourOptions.map(hour => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleHoursChange(Math.min(23, timeSettings.hours + 1))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
                disabled={timeSettings.useCurrentTime}
              >
                +
              </button>
            </div>
          </div>

          {/* Minutes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {minuteLabel}
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const currentIndex = minuteOptions.indexOf(timeSettings.minutes);
                  const newIndex = Math.max(0, currentIndex - 1);
                  handleMinutesChange(minuteOptions[newIndex]);
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
                disabled={timeSettings.useCurrentTime}
              >
                -
              </button>
              <select
                value={timeSettings.minutes}
                onChange={(e) => handleMinutesChange(parseInt(e.target.value))}
                disabled={timeSettings.useCurrentTime}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {minuteOptions.map(minute => (
                  <option key={minute} value={minute}>
                    {minute.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const currentIndex = minuteOptions.indexOf(timeSettings.minutes);
                  const newIndex = Math.min(minuteOptions.length - 1, currentIndex + 1);
                  handleMinutesChange(minuteOptions[newIndex]);
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
                disabled={timeSettings.useCurrentTime}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <div className="font-medium">Selected Time:</div>
          <div className="font-mono text-lg">
            {timeSettings.hours.toString().padStart(2, '0')}:
            {timeSettings.minutes.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeControls;

