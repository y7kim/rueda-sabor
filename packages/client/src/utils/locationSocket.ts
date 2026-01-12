import { io, Socket } from 'socket.io-client';
import { API_URL } from '~/config';

export interface ClientLocation {
    id: string;
    lat: number;
    lng: number;
}

export class LocationSocket {
    private socket: Socket;

    constructor() {
        this.socket = io(API_URL.replace(/^http/, 'ws'));
    }

    sendLocation(lat: number, lng: number) {
        this.socket.emit('clientLocation', { lat, lng });
    }

    onLocationsUpdate(cb: (locations: ClientLocation[]) => void) {
        this.socket.on('locations', cb);
    }

    disconnect() {
        this.socket.disconnect();
    }
}
