import { MapPin, AlertCircle, Wifi } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface MapPlaceholderProps {
  /** Type of placeholder: 'loading', 'error', 'no-key', 'no-location' */
  type?: 'loading' | 'error' | 'no-key' | 'no-location';
  /** Optional error message to display */
  errorMessage?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Optional action button text and callback */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Show mock markers for demo */
  showMockMarkers?: boolean;
  /** Height of the placeholder */
  height?: string;
}

/**
 * Fallback UI for map display when Google Maps is unavailable
 * Handles loading, error, no-API-key, and no-location states
 */
export function MapPlaceholder({
  type = 'no-key',
  errorMessage,
  onRetry,
  action,
  showMockMarkers = true,
  height = 'h-96',
}: MapPlaceholderProps) {
  const getContent = () => {
    switch (type) {
      case 'loading':
        return {
          icon: <Wifi className="w-12 h-12 text-blue-400 animate-pulse" />,
          title: 'Loading Map',
          description: 'Please wait while we load the map...',
        };

      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-400" />,
          title: 'Map Error',
          description:
            errorMessage || 'An error occurred while loading the map. Please try again.',
          showRetry: true,
        };

      case 'no-location':
        return {
          icon: <MapPin className="w-12 h-12 text-amber-400" />,
          title: 'Location Not Available',
          description:
            'Enable location access or search by address to see the map.',
          showRetry: false,
        };

      case 'no-key':
      default:
        return {
          icon: <AlertCircle className="w-12 h-12 text-gray-400" />,
          title: 'Map Unavailable',
          description:
            'Maps are not available in this session. Showing list view instead.',
          showRetry: false,
        };
    }
  };

  const content = getContent();

  return (
    <div className={`${height} w-full relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden`}>
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(0deg, #000 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Mock markers for demo (if enabled) */}
      {showMockMarkers && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Marker 1 */}
          <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-8 h-8 bg-red-500 rounded-full opacity-40 animate-pulse" />
              <div className="absolute inset-0 w-8 h-8 border-2 border-red-500 rounded-full" />
            </div>
          </div>

          {/* Marker 2 */}
          <div className="absolute top-2/3 right-1/4 transform translate-x-1/2 translate-y-1/2">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-500 rounded-full opacity-40 animate-pulse" />
              <div className="absolute inset-0 w-8 h-8 border-2 border-blue-500 rounded-full" />
            </div>
          </div>

          {/* Marker 3 */}
          <div className="absolute top-1/3 right-1/5 transform translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-8 h-8 bg-green-500 rounded-full opacity-40 animate-pulse" />
              <div className="absolute inset-0 w-8 h-8 border-2 border-green-500 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <Card className="p-8 text-center max-w-sm border-0 shadow-lg bg-white">
          <div className="flex justify-center mb-4">{content.icon}</div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {content.title}
          </h3>

          <p className="text-sm text-gray-600 mb-6">{content.description}</p>

          {/* Actions */}
          <div className="flex gap-2 justify-center">
            {content.showRetry && onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Wifi className="w-4 h-4" />
                Retry
              </Button>
            )}

            {action && (
              <Button onClick={action.onClick} size="sm">
                {action.label}
              </Button>
            )}

            {!content.showRetry && !action && (
              <p className="text-xs text-gray-500 italic">
                Using list view as fallback
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MapPlaceholder;
