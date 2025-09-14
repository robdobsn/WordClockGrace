import { useState, useEffect } from 'react';
import { ClockLayout } from '../types/layout';

// Function to discover available layouts dynamically
async function discoverLayouts(): Promise<string[]> {
  try {
    // This is a simplified approach - in a real app you might use a backend API
    // For now, we'll try to load known layout files and handle 404s gracefully
    const knownLayouts = [
      'military-standard',
      'compact-vertical', 
      'military-condensed',
      'crossword-one',
      'gracegpt',
      'gracegpt2',
      'auto-layout',
      'updated-layout'
    ];
    
    const availableLayouts: string[] = [];
    
    for (const layoutName of knownLayouts) {
      try {
        const response = await fetch(`/layouts/${layoutName}.json`);
        if (response.ok) {
          availableLayouts.push(layoutName);
        }
      } catch (error) {
        // Layout doesn't exist, skip it
        console.debug(`Layout ${layoutName} not found`);
      }
    }
    
    return availableLayouts;
  } catch (error) {
    console.error('Error discovering layouts:', error);
    // Fallback to basic layouts
    return ['military-standard', 'compact-vertical', 'military-condensed', 'crossword-one'];
  }
}

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
    // Discover available layouts dynamically
    const initializeLayouts = async () => {
      try {
        const layouts = await discoverLayouts();
        setAvailableLayouts(layouts);
        
        // Load default layout (first available one)
        if (layouts.length > 0) {
          loadLayout(layouts[0]);
        }
      } catch (error) {
        console.error('Failed to initialize layouts:', error);
        // Fallback
        setAvailableLayouts(['military-standard']);
        loadLayout('military-standard');
      }
    };
    
    initializeLayouts();
  }, []);

  return {
    layout,
    availableLayouts,
    loading,
    error,
    loadLayout
  };
}
