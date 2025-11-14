import { useEffect, useState } from 'react';

interface UseMapLoaderState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  apiKey: string | null;
  hasValidKey: boolean;
}

declare global {
  interface Window {
    google?: {
      maps?: any;
    };
  }
}

/**
 * Hook to dynamically load Google Maps JS API
 * - Only loads on client side
 * - Checks for NEXT_PUBLIC_MAP_API_KEY environment variable
 * - Returns loading state and whether map API is available
 */
export const useMapLoader = (): UseMapLoaderState => {
  const [state, setState] = useState<UseMapLoaderState>({
    isLoaded: false,
    isLoading: true,
    error: null,
    apiKey: null,
    hasValidKey: false,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_MAP_API_KEY || '';
    const isDummy = apiKey === 'dummy' || apiKey === '';
    const hasValidKey = !isDummy && apiKey.length > 0;

    // If Google Maps script already loaded, skip
    if (window.google?.maps) {
      setState({
        isLoaded: true,
        isLoading: false,
        error: null,
        apiKey: apiKey || null,
        hasValidKey,
      });
      return;
    }

    // If no valid key, mark as ready but invalid
    if (!hasValidKey) {
      setState({
        isLoaded: false,
        isLoading: false,
        error: isDummy
          ? 'Map API key not configured. Set NEXT_PUBLIC_MAP_API_KEY environment variable.'
          : 'Map API key is empty',
        apiKey: null,
        hasValidKey: false,
      });
      return;
    }

    // Dynamically load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    script.async = true;
    script.defer = true;

    const handleLoad = () => {
      setState({
        isLoaded: true,
        isLoading: false,
        error: null,
        apiKey,
        hasValidKey: true,
      });
    };

    const handleError = () => {
      setState({
        isLoaded: false,
        isLoading: false,
        error: 'Failed to load Google Maps API. Check your API key and billing settings.',
        apiKey,
        hasValidKey: false,
      });
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  return state;
};
