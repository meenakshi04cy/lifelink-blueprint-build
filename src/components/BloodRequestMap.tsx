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

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Create a feature group to hold all markers for bounds calculation
    const featureGroup = L.featureGroup();

    // Add user location marker (highlighted - larger blue circle with "YOU")
    const userMarker = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(30, 64, 175, 0.5);
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          line-height: 1.2;
        ">
          YOU
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
      popupAnchor: [0, -25],
      className: "user-marker",
    });

    const userMarkerInstance = L.marker(
      [userLocation.latitude, userLocation.longitude],
      { icon: userMarker }
    ).addTo(mapRef.current);

    userMarkerInstance.bindPopup("📍 Your Location");
    markersRef.current.push(userMarkerInstance);
    featureGroup.addLayer(userMarkerInstance);

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

    // Add hospital markers (blue dots) - blood request locations
    hospitals.forEach((hospital) => {
      if (hospital.lat && hospital.lng) {
        const popupContent = `
          <div class="text-sm p-2">
            <p class="font-semibold mb-1">${hospital.name}</p>
            <p class="text-xs"><strong>Patient Blood:</strong> ${hospital.bloodType}</p>
            <p class="text-xs"><strong>Urgency:</strong> <span style="color: ${
              hospital.urgency === "critical"
                ? "#dc2626"
                : hospital.urgency === "urgent"
                ? "#ea580c"
                : "#16a34a"
            }; font-weight: bold;">${hospital.urgency}</span></p>
            <p class="text-xs"><strong>Units:</strong> ${hospital.units}</p>
            ${
              hospital.distance
                ? `<p class="text-xs text-blue-600 mt-1"><strong>Distance:</strong> ${hospital.distance.toFixed(1)} km</p>`
                : ""
            }
          </div>
        `;

        // Create blue circle marker for blood requests
        const marker = L.circleMarker([hospital.lat, hospital.lng], {
          radius: 12,
          fillColor: "#3b82f6",
          color: "#1e40af",
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.7,
        })
          .addTo(mapRef.current!)
          .bindPopup(popupContent);

        // Add click handler to open request details
        marker.on("click", () => {
          hospital.onClick();
        });

        markersRef.current.push(marker);
        featureGroup.addLayer(marker);
      }
    });

    // Auto-fit map to show all markers with padding
    if (featureGroup.getLayers().length > 1) {
      mapRef.current.fitBounds(featureGroup.getBounds(), { padding: [50, 50] });
    } else if (featureGroup.getLayers().length === 1) {
      // Just user location, zoom to default level
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 12);
    }
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
