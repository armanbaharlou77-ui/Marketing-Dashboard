"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({
                lat,
                lng,
            });
        },
    });

    if (!position?.lat || !position?.lng) return null;

    return <Marker position={[position.lat, position.lng]} />;
}

export default function LocationPicker({ position, setPosition }) {
    const defaultCenter = position?.lat && position?.lng
        ? [position.lat, position.lng]
        : [32.6546, 51.6680];

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="h-[350px] w-full">
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ width: "100%", height: "100%", zIndex: '0' }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>
        </div>
    );
}