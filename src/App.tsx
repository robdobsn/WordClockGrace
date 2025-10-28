import React, { useState, useEffect } from 'react';
import ClockDisplay from './components/ClockDisplay';
import TimeControls from './components/TimeControls';
import FontControls from './components/FontControls';
import DXFExport from './components/DXFExport';
import { useLayout } from './hooks/useLayout';
import { useCurrentTime } from './hooks/useCurrentTime';
import { FontSettings, TimeSettings } from './types/layout';

function App() {
  const { layout, availableLayouts, layoutsMetadata, loading, error, loadLayout, getLayoutMetadata } = useLayout();
  
  const [timeSettings, setTimeSettings] = useState<TimeSettings>({
    hours: 11,
    minutes: 0,
    useCurrentTime: false
  });

  const [fontSettings, setFontSettings] = useState<FontSettings>({
    family: 'Monaco, Menlo, Ubuntu Mono, monospace',
    weight: '700',
    size: 24,
    letterSpacing: 0.1,
    cellSpacingX: 12,
    cellSpacingY: 12,
    margin: 20,
    useVectorPaths: true,
    addBorder: true,
    addGridLines: false
  });

  const currentTime = useCurrentTime(timeSettings.useCurrentTime);

  // Update time settings when current time changes
  useEffect(() => {
    if (timeSettings.useCurrentTime) {
      setTimeSettings(prev => ({
        ...prev,
        hours: currentTime.hours,
        minutes: currentTime.minutes
      }));
    }
  }, [currentTime, timeSettings.useCurrentTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading word clock...</p>
        </div>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error || 'Failed to load layout'}</p>
          <button 
            onClick={() => loadLayout('military-standard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Word Clock Grace
            </h1>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Layout:</label>
              <select
                value={layout.name.toLowerCase().replace(/\s+/g, '-')}
                onChange={(e) => loadLayout(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableLayouts.map(layoutName => (
                  <option key={layoutName} value={layoutName}>
                    {layoutName.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Clock Display - Takes up most space */}
          <div className="lg:col-span-2 flex justify-center">
        <ClockDisplay 
          layout={layout}
          hours={timeSettings.hours}
          minutes={timeSettings.minutes}
          fontSettings={fontSettings}
          layoutMetadata={getLayoutMetadata(layout.name.toLowerCase().replace(/\s+/g, '-'))}
        />
          </div>

          {/* Controls */}
          <div className="lg:col-span-2 space-y-6">
            <TimeControls 
              timeSettings={timeSettings}
              onTimeChange={setTimeSettings}
              layoutMetadata={getLayoutMetadata(layout.name.toLowerCase().replace(/\s+/g, '-'))}
            />
            
            <FontControls
              fontSettings={fontSettings}
              onFontChange={setFontSettings}
            />
            
            <DXFExport layout={layout} fontSettings={fontSettings} />
          </div>
        </div>

        {/* Layout Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Layout Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Name:</strong> {layout.name}
            </div>
            <div>
              <strong>Description:</strong> {layout.description}
            </div>
            <div>
              <strong>Grid Size:</strong> {layout.gridWidth} × {layout.gridHeight}
            </div>
            <div>
              <strong>Total Words:</strong> {layout.words.length}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Word Clock Grace - Inspired by{' '}
              <a 
                href="https://www.qlocktwo.com/en-us" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                QlockTwo
              </a>
              {' '}with military time format
            </p>
            <p className="mt-1">
              Experiment with different layouts, fonts, and time displays
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

