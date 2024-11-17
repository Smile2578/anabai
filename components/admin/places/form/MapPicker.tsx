// components/admin/places/form/MapPicker.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from "@/components/ui/card";

interface MapPickerProps {
  value?: [number, number];
  onChange?: (coords: [number, number]) => void;
}

const MapPicker = ({ value = [35.6762, 139.6503], onChange }: MapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    const initMap = async () => {
      await new Loader({
        apiKey: process.env.GOOGLE_MAPS_API_KEY!,
        version: 'weekly'
      }).importLibrary("maps");

      const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

      if (!mapRef.current) return;

      const initialPosition = { lat: value[0], lng: value[1] };
      
      const mapInstance = new Map(mapRef.current, {
        center: initialPosition,
        zoom: 15,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      const markerInstance = new AdvancedMarkerElement({
        position: initialPosition,
        map: mapInstance,
        gmpDraggable: true
      });

      markerInstance.addListener('dragend', () => {
        const position = markerInstance.position as google.maps.LatLng;
        if (position && onChange) {
          onChange([position.lat(), position.lng()]);
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);
    };

    initMap();
  }, [onChange, value]);

  useEffect(() => {
    if (marker && value) {
      marker.position = { lat: value[0], lng: value[1] };
      map?.panTo({ lat: value[0], lng: value[1] });
    }
  }, [map, marker, value]);

  return (
    <Card>
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-md overflow-hidden"
      />
    </Card>
  );
};

export default MapPicker;