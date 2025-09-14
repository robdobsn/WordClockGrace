import { useState, useEffect } from 'react';
import { ClockLayout } from '../types/layout';

export function useLayout() {
  const [layout, setLayout] = useState<ClockLayout | null>(null);
  const [availableLayouts, setAvailableLayouts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLayout = async (layoutName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/layouts/${layoutName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load layout: ${response.statusText}`);
      }
      
      const layoutData: ClockLayout = await response.json();
      setLayout(layoutData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layout');
      console.error('Error loading layout:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize with available layouts
    setAvailableLayouts(['military-standard', 'compact-vertical']);
    
    // Load default layout
    loadLayout('military-standard');
  }, []);

  return {
    layout,
    availableLayouts,
    loading,
    error,
    loadLayout
  };
}
