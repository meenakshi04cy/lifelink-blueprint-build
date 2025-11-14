import { useState, useEffect, useCallback } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface UseGeolocationState {
  loading: boolean;
  error: string | null;
  coords: GeolocationCoordinates | null;
  permissionDenied: boolean;
}

/**
 * Hook to request and track user geolocation
 * - Always asks for permission before accessing location
 * - Returns error if permission denied
 * - Respects privacy by not auto-requesting on page load
 */
export const useGeolocation = () => {
  const [state, setState] = useState<UseGeolocationState>({
    loading: false,
    error: null,
    coords: null,
    permissionDenied: false,
  });

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        permissionDenied: true,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setState({
          loading: false,
          error: null,
          coords: { latitude, longitude, accuracy },
          permissionDenied: false,
        });
      },
      (error) => {
        let errorMessage = 'Could not get your location';
        let permissionDenied = false;

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable it in settings.';
          permissionDenied = true;
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }

        setState({
          loading: false,
          error: errorMessage,
          coords: null,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy: false, // Balance between accuracy and battery
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setState({
          loading: false,
          error: null,
          coords: { latitude, longitude, accuracy },
          permissionDenied: false,
        });
      },
      (error) => {
        let errorMessage = 'Could not get your location';

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          permissionDenied: error.code === error.PERMISSION_DENIED,
        }));
      },
      {
        enableHighAccuracy: false,
        maximumAge: 0,
      }
    );

    return watchId;
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      loading: false,
      error: null,
      coords: null,
      permissionDenied: false,
    });
  }, []);

  return {
    ...state,
    requestLocation,
    watchLocation,
    clearLocation,
  };
};
