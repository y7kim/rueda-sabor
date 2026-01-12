import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ClientLocation {
    id: string;
    lat: number;
    lng: number;
}

@WebSocketGateway({ cors: true })
export class LocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clients: Map<string, ClientLocation> = new Map();

    handleConnection(client: Socket) {
        // Optionally log or track connection
    }

    handleDisconnect(client: Socket) {
        this.clients.delete(client.id);
        this.broadcastLocations();
    }

    @SubscribeMessage('clientLocation')
    handleClientLocation(@MessageBody() data: { lat: number; lng: number }, @ConnectedSocket() client: Socket) {
        this.clients.set(client.id, { id: client.id, lat: data.lat, lng: data.lng });
        this.broadcastLocations();
    }

    private broadcastLocations() {
        this.server.emit('locations', Array.from(this.clients.values()));
    }
}
