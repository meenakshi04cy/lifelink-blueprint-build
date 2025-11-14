import { MapPin, Navigation } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Coordinates, calculateDistance, getDirectionsUrl } from '../lib/geo';

export interface LocationBadgeProps {
  /** Location name or city */
  city: string;
  /** Optional user location to calculate distance */
  userLocation?: Coordinates;
  /** Location coordinates */
  location: Coordinates;
  /** Variant style */
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  /** Show directions button */
  showDirections?: boolean;
  /** Size of badge */
  size?: 'sm' | 'md';
  /** Custom className */
  className?: string;
}

/**
 * Location display badge showing city and distance
 * Optionally displays directions link
 */
export function LocationBadge({
  city,
  userLocation,
  location,
  variant = 'secondary',
  showDirections = true,
  size = 'sm',
  className = '',
}: LocationBadgeProps) {
  const distance = userLocation
    ? calculateDistance(userLocation, location)
    : null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  const directionsUrl = getDirectionsUrl(location, userLocation);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={variant} className={sizeClasses[size]}>
        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
        <span className="truncate">{city}</span>
        {distance !== null && (
          <>
            <span className="mx-1">•</span>
            <span className="font-medium">{distance}km</span>
          </>
        )}
      </Badge>

      {showDirections && distance !== null && (
        <Button
          size="sm"
          variant="ghost"
          asChild
          className="h-6 px-2 text-xs"
          title="Get directions"
        >
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <Navigation className="w-3 h-3" />
          </a>
        </Button>
      )}
    </div>
  );
}

/**
 * Alternative compact version - just badge without directions
 */
export function LocationBadgeCompact({
  city,
  distance,
  variant = 'secondary',
}: {
  city: string;
  distance?: number;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}) {
  return (
    <Badge variant={variant} className="text-xs">
      <MapPin className="w-3 h-3 mr-1" />
      {city}
      {distance !== undefined && distance !== null && (
        <>
          <span className="mx-1">•</span>
          <span>{distance}km</span>
        </>
      )}
    </Badge>
  );
}

export default LocationBadge;
