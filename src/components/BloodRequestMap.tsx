import { useEffect, useRef } from "react";
import L from "leaflet";

interface Hospital {
  lat: number;
  lng: number;
  name: string;
  type: "hospital";
  bloodType: string;
  urgency: string;
  distance: number;
  units: number;
  onClick: () => void;
}

interface BloodRequestMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  hospitals: Hospital[];
  radius: number;
}

const BloodRequestMap = ({
  userLocation,
  hospitals,
  radius,
}: BloodRequestMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!userLocation) return;

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = L.map("blood-map").setView(
        [userLocation.latitude, userLocation.longitude],
        12
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Update map center to user location
    mapRef.current.setView([userLocation.latitude, userLocation.longitude]);

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add user location marker (blue)
    const userMarker = L.circleMarker(
      [userLocation.latitude, userLocation.longitude],
      {
        radius: 8,
        fillColor: "#3b82f6",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }
    ).addTo(mapRef.current);

    userMarker.bindPopup("📍 Your Location");
    markersRef.current.push(userMarker);

    // Add radius circle
    L.circle([userLocation.latitude, userLocation.longitude], {
      radius: radius * 1000, // Convert km to meters
      color: "#3b82f6",
      weight: 2,
      opacity: 0.3,
      fill: true,
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
      dashArray: "5, 5",
    }).addTo(mapRef.current);

    // Add hospital markers (red) - only if they have valid coordinates
    hospitals.forEach((hospital) => {
      if (hospital.lat && hospital.lng) {
        const popupContent = `
          <div class="text-sm">
            <p class="font-semibold">${hospital.name}</p>
            <p class="text-xs"><strong>Blood:</strong> ${hospital.bloodType}</p>
            <p class="text-xs"><strong>Urgency:</strong> ${hospital.urgency}</p>
            <p class="text-xs"><strong>Units:</strong> ${hospital.units}</p>
            ${hospital.distance ? `<p class="text-xs text-blue-600"><strong>Distance:</strong> ${hospital.distance.toFixed(1)} km</p>` : ""}
          </div>
        `;

        const marker = L.marker([hospital.lat, hospital.lng], {
          icon: L.icon({
            iconUrl:
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjEyIiB5PSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIj5IPC90ZXh0Pjwvc3ZnPg==",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
        })
          .addTo(mapRef.current!)
          .bindPopup(popupContent);

        markersRef.current.push(marker);
      }
    });
  }, [userLocation, hospitals, radius]);

  if (!userLocation) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
        Waiting for location...
      </div>
    );
  }

  return <div id="blood-map" className="w-full h-96 rounded-lg" />;
};

export default BloodRequestMap;
