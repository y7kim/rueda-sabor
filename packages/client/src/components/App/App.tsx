// React and library imports
import React, { type FC, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

// Project imports
import { Dictionary } from '@rueda-sabor/domain';
import { API_URL } from '~/config';
import { Logger, checkServerVersion } from '~/utils';
import { LocationSocket, ClientLocation } from '~/utils/locationSocket';

export const App: FC<unknown> = () => {
  // State
  const [response, setResponse] = useState<string>('NO SERVER RESPONSE');
  const [locations, setLocations] = useState<ClientLocation[]>([]);
  const [myLocation, setMyLocation] = useState<LatLngExpression | null>(null);

  // Fetch API response
  useEffect(() => {
    async function fetchResponse(): Promise<void> {
      try {
        const res = await fetch(API_URL);
        const data = await res.text();
        setResponse(data);
      } catch (err) {
        Logger.error(err);
      }
    }
    fetchResponse();
  }, []);

  // Check server version
  useEffect(() => {
    checkServerVersion();
  }, []);

  // Geolocation and WebSocket logic
  useEffect(() => {
    const locSocket = new LocationSocket();
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setMyLocation([latitude, longitude]);
          locSocket.sendLocation(latitude, longitude);
        },
        err => Logger.error(err),
        { enableHighAccuracy: true }
      );
    }
    locSocket.onLocationsUpdate(setLocations);
    return () => {
      if (watchId && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
      locSocket.disconnect();
    };
  }, []);

  // Example usage of Dictionary
  const dictExample: Dictionary<number> = {
    first: 1,
    second: 2,
  };

  // Render
  return (
    <>
      <div>
        Here we use a <code>Dictionary&lt;number&gt;</code> interface from the{' '}
        <code>@rueda-sabor/domain</code> package:
        <pre>{JSON.stringify(dictExample)}</pre>
      </div>
      <div>
        And here we get a response from the API:
        <br />
        <br />
        {response}
      </div>
      <div style={{ height: 400, margin: '2em 0' }}>
        <MapContainer
          center={myLocation || [0, 0]}
          zoom={myLocation ? 13 : 2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            // @ts-ignore
            attribution="&copy; OpenStreetMap contributors"
          />
          {myLocation && (
            <Marker position={myLocation}>
              <Popup>Your location</Popup>
            </Marker>
          )}
          {locations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>Client: {loc.id}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
};
