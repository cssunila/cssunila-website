"use client";

import { useState, useEffect, memo, useRef } from "react";
import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MapControls,
    MapRef,
} from "@/components/ui/map";
import { MapPin, Navigation } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Link from "next/link";

const DEFAULT_LAT = -5.3668101;
const DEFAULT_LNG = 105.2436541;
const DEFAULT_LOCATION_NAME = "FMIPA Universitas Lampung";
const DEFAULT_STYLE = "https://tiles.openfreemap.org/styles/bright";

const style_map = {
    openstreetmap: "https://tiles.openfreemap.org/styles/bright",
    openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
};

type StyleKey = keyof typeof style_map;

type LocationData = {
    latitude: number;
    longitude: number;
};

type MapPickerProps = {
    locationName?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    onChange: (data: LocationData) => void;
};

export const MapLocationPicker = memo(({
    locationName,
    latitude,
    longitude,
    onChange,
}: MapPickerProps) => {
    const [name, setName] = useState<string>(locationName || DEFAULT_LOCATION_NAME);
    const [lat, setLat] = useState<number>(latitude ?? DEFAULT_LAT);
    const [lng, setLng] = useState<number>(longitude ?? DEFAULT_LNG);

    useEffect(() => {
        (async () => {
            if (locationName) setName(locationName);
            if (latitude) setLat(latitude);
            if (longitude) setLng(longitude);
        })()
    }, [locationName, latitude, longitude]);

    const updateLocation = (newLat: number, newLng: number) => {
        setLat(newLat);
        setLng(newLng);
        onChange({
            latitude: newLat,
            longitude: newLng,
        });
    };

    return (


        <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-white/10 shadow-lg">
            <Map
                center={[lng, lat]}
                zoom={15}
                styles={{ light: DEFAULT_STYLE, dark: DEFAULT_STYLE }}
                className="h-full w-full"
            >
                <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-x-3 gap-y-1 rounded px-2 py-1.5 font-mono text-xs">
                    <span className="rounded-md bg-background/80 border px-2 py-1 text-[11px]">
                        Lat: {lat.toFixed(6)}
                    </span>
                    <span className="rounded-md bg-background/80 border px-2 py-1 text-[11px]">
                        Long: {lng.toFixed(6)}
                    </span>
                </div>
                <MapMarker
                    longitude={lng}
                    latitude={lat}
                    draggable
                    onDragEnd={(coords) => {
                        updateLocation(coords.lat, coords.lng);
                    }}
                >
                    <MarkerContent>
                        <div className="group relative flex flex-col items-center">
                            <div className="flex size-9 items-center justify-center rounded-full bg-destructive shadow-lg shadow-destructive/40 text-white animate-bounce">
                                <MapPin size={20} className="fill-white/30" />
                            </div>
                            <div className="mt-1 rounded-md bg-slate-950/90 px-2 py-0.5 text-[10px] font-bold text-white shadow backdrop-blur whitespace-nowrap border border-white/10">
                                {name || "Lokasi Lomba"}
                            </div>
                        </div>
                    </MarkerContent>
                </MapMarker>
                <MapControls
                    position="top-right"
                    showZoom
                    showLocate
                    showCompass
                    showFullscreen
                />
            </Map>
        </div>
    );
});

MapLocationPicker.displayName = "MapLocationPicker";

type MapDisplayProps = {
    locationName?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    nonLomba?: boolean;
};

export const MapLocationView = ({
    locationName,
    latitude,
    longitude,
    nonLomba
}: MapDisplayProps) => {
    const lat = latitude ?? DEFAULT_LAT;
    const lng = longitude ?? DEFAULT_LNG;
    const name = locationName || DEFAULT_LOCATION_NAME;
    const [style, setStyle] = useState<StyleKey>("openstreetmap");
    const selectedStyle = style_map[style];
    const is3D = style === "openstreetmap3d";
    const mapRef = useRef<MapRef>(null);

    useEffect(() => {
        mapRef.current?.easeTo({ pitch: is3D ? 60 : 0, duration: 500 });
    }, [is3D]);

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    return (
        <div className="glass rounded-3xl p-6 md:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-strong mb-1">
                        {!nonLomba && <><MapPin size={14} /> Lokasi Pelaksanaan</>}
                    </span>
                    <h3 className="font-display text-xl font-bold text-foreground">
                        {name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        Koordinat: {lat.toFixed(6)}, {lng.toFixed(6)}
                    </p>
                </div>

                <Link
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-strong/20 border border-cyan-strong/30 px-5 py-2.5 text-xs font-semibold text-cyan-strong hover:bg-cyan-strong/30 transition shrink-0"
                >
                    <Navigation size={14} />
                    Buka Google Maps
                </Link>
            </div>

            <div className="relative h-80 md:h-96 w-full overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                <Map
                    ref={mapRef}
                    center={[lng, lat]}
                    zoom={15}
                    className="h-full w-full"
                    styles={{
                        light: selectedStyle,
                        dark: selectedStyle,
                    }}
                >
                    <div className="absolute top-2 left-2 z-10">
                        <Select

                            required
                            defaultValue={style}
                            onValueChange={(newValue: string) => setStyle(newValue as StyleKey)}
                        >
                            <SelectTrigger className="w-full bg-black!">
                                <SelectValue placeholder="Pilih Style Map" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(style_map).map(([key]) => (
                                    <SelectItem key={key} value={key}>
                                        {key === 'openstreetmap3d' ? 'Lihat 3D' : 'Lihat 2D'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <MapMarker longitude={lng} latitude={lat}>
                        <MarkerContent>
                            <div className="flex flex-col items-center">
                                <div className="flex size-10 items-center justify-center rounded-full bg-cyan-strong text-slate-950 shadow-lg shadow-cyan-strong/50 animate-pulse">
                                    <MapPin size={22} className="fill-slate-950/20" />
                                </div>
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-1">
                                <p className="font-bold text-sm">{name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {lat.toFixed(5)}, {lng.toFixed(5)}
                                </p>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                    <MapControls
                        position="top-right"
                        showZoom
                        showLocate
                        showFullscreen
                    />
                </Map>
            </div>
        </div>
    );
};
