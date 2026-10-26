'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STAM_OMRADEN } from '@/lib/bibel-data';

// Anpassade, stilrena kartikoner för markörer
const skapadIkon = (kategori, arVald, prioritet) => {
  const isSecondary = prioritet === 2;
  const farg = arVald ? '#c85a32' : isSecondary ? '#575c58' : '#2d3732'; // Lite dovare färg på sekundära
  const storlek = arVald ? 20 : isSecondary ? 10 : 14;

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: ${storlek}px;
        height: ${storlek}px;
        background-color: ${farg};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transition: transform 0.2s ease;
      "></div>
    `,
    iconSize: [storlek, storlek],
    iconAnchor: [storlek / 2, storlek / 2],
  });
};

// Hjälpkomponent för att hantera zoom och mjukt flytta kartan samt stänga tidigare popups
function KartFokus({ valdVard }) {
  const map = useMap();

  useEffect(() => {
    if (valdVard?.koordinater) {
      // Stäng öppen popup så att kartan inte dras tillbaka till tidigare klickad plats
      map.closePopup();

      // Bestäm zoomnivå vid fokus
      const targetZoom = valdVard.prioritet === 2 ? 8 : 9;

      map.flyTo(valdVard.koordinater, targetZoom, {
        duration: 1.2,
        animate: true,
      });
    }
  }, [valdVard, map]);

  return null;
}

// Hjälpkomponent som rapporterar aktuell zoom till föräldern
function ZoomLyssnare({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

// Lista på absolut viktigaste nyckelnaven vid utzoomat läge (Zoom <= 6)
const SUPER_PRIMARA_ID = new Set([
  'jerusalem_monarki',
  'jerusalem_evangelier',
  'jerusalem_paulus',
  'rom',
  'rom_kyrkohistoria',
  'alexandria',
  'antiokia_syrien',
  'babylon',
  'nasaret',
  'ur',
  'haran',
  'sinai_berg',
  'nicea',
  'konstantinopel',
]);

export default function BibelKartaKomponent({ platser, rutter, valdVard, onValjPlats, valdRuttId }) {
  const [aktuellZoom, setAktuellZoom] = useState(5);

  // Standardcentrum (Medelhavet/Mellanöstern)
  const standardCentrum = [35.5, 28.0];
  const standardZoom = 5;

  // Kontrollera om den aktiva epoken är Israels 12 stammar
  const visarStammar = platser.some((p) => p.epokId === 'gt_stammar');

  // Filtrera platser baserat på den förskjutna zoomtrappan
  const synligaPlatser = platser.filter((plats) => {
    // 1. Om platsen är markerad som vald eller sökts fram -> VISA ALLTID
    if (valdVard?.id === plats.id) return true;

    // 2. Övergripande vy (Zoom 1–6): Visa endast de absolut viktigaste nyckelnaven
    if (aktuellZoom <= 6) {
      return SUPER_PRIMARA_ID.has(plats.id);
    }

    // 3. Mellanzoom (Zoom 7–8): Visa alla primära städer (prioritet: 1)
    if (aktuellZoom >= 7 && aktuellZoom <= 8) {
      return plats.prioritet === 1;
    }

    // 4. Inzoomat läge (Zoom >= 9): Visa alla platser (både prioritet 1 och 2)
    return true;
  });

  return (
    <div className="relative w-full h-full">
      {/* CSS-stil för ortsetiketter */}
      <style jsx global>{`
        .map-orth-label {
          background-color: rgba(255, 255, 255, 0.92) !important;
          border: 1px solid #e8e4df !important;
          border-radius: 6px !important;
          padding: 2px 6px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #1a1d1b !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1) !important;
          white-space: nowrap !important;
        }
        .map-orth-label-selected {
          background-color: #2d3732 !important;
          color: #ffffff !important;
          border-color: #2d3732 !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: rgba(255, 255, 255, 0.92) !important;
        }
      `}</style>

      <MapContainer
        center={standardCentrum}
        zoom={standardZoom}
        style={{ width: '100%', height: '100%', backgroundColor: '#faf8f5' }}
        zoomControl={true}
      >
        {/* Lyssna på zoom-ändringar */}
        <ZoomLyssnare onZoomChange={setAktuellZoom} />

        {/* Esri World Topo */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), swisstopo, MapmyIndia, &#169; OpenStreetMap contributors, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Ritar ut Israels 12 stamområden som polygoner när "gt_stammar" är valt */}
        {visarStammar &&
          STAM_OMRADEN.map((stam) => (
            <Polygon
              key={stam.id}
              positions={stam.polygon}
              pathOptions={{
                color: stam.farg,
                fillColor: stam.farg,
                fillOpacity: 0.22,
                weight: 2,
                dashArray: '4, 6',
              }}
            >
              <Tooltip permanent direction="center" className="map-orth-label">
                {stam.namn}s stam
              </Tooltip>
            </Polygon>
          ))}

        {/* Ritar ut historiska rutter */}
        {rutter.map((rutt) => {
          const arFramhavd = !valdRuttId || valdRuttId === rutt.id;
          return (
            <Polyline
              key={rutt.id}
              positions={rutt.punkter}
              pathOptions={{
                color: rutt.farg || '#c85a32',
                weight: arFramhavd ? 4 : 2,
                dashArray: '6, 8',
                opacity: arFramhavd ? 0.9 : 0.25,
              }}
            />
          );
        })}

        {/* Ritar ut synliga ortsmarkörer */}
        {synligaPlatser.map((plats) => {
          const arVald = valdVard?.id === plats.id;
          return (
            <Marker
              key={plats.id}
              position={plats.koordinater}
              icon={skapadIkon(plats.kategori, arVald, plats.prioritet)}
              eventHandlers={{
                click: () => onValjPlats(plats),
              }}
            >
              <Tooltip
                permanent={true}
                direction="top"
                offset={[0, -10]}
                interactive={false}
                className={`map-orth-label ${arVald ? 'map-orth-label-selected' : ''}`}
              >
                {plats.namn}
              </Tooltip>

              <Popup className="custom-leaflet-popup">
                <div className="p-1">
                  <span className="text-[10px] font-semibold text-[#737874] uppercase tracking-wider block">
                    {plats.kategori}
                  </span>
                  <strong className="text-sm font-bold text-[#1a1d1b] block">{plats.namn}</strong>
                  <span className="text-xs text-[#575c58] block mt-0.5">Idag: {plats.idag}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Styr kartans fokus vid klick eller sökning */}
        <KartFokus valdVard={valdVard} />
      </MapContainer>

      {/* TECKENFÖRKLARING FÖR RUTTER */}
      {rutter.length > 0 && (
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-[#e8e4df] shadow-md z-[1000] max-w-[220px]">
          <span className="text-[10px] font-bold text-[#1a1d1b] uppercase tracking-wider block mb-2 border-b border-[#e8e4df] pb-1">
            Resvägar & Rutter
          </span>
          <div className="space-y-1.5">
            {rutter.map((rutt) => (
              <div key={rutt.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-1 rounded-full shrink-0"
                  style={{ backgroundColor: rutt.farg }}
                />
                <span className="text-[11px] text-[#2d3732] font-medium truncate">
                  {rutt.namn}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}