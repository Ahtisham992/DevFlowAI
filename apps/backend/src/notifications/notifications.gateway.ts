/* eslint-disable */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email?: string;
  iat?: number;
  exp?: number;
}

@WebSocketGateway({
  cors: {
    origin: '*', // For development
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map to store userId -> active sockets
  private activeClients = new Map<string, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    try {
      const auth = client.handshake.auth as { token?: string };
      const headers = client.handshake.headers as { authorization?: string };
      const token = auth.token || headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = String(payload.sub);

      client.data = { userId };

      if (!this.activeClients.has(userId)) {
        this.activeClients.set(userId, new Set<string>());
      }
      this.activeClients.get(userId)?.add(client.id);

      console.log(
        `[WebSocket] Client connected: ${client.id} (User: ${userId})`,
      );
    } catch (_error) {
      console.log(`[WebSocket] Unauthorized connection attempt: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const data = client.data as { userId?: string };
    const userId = data.userId ? String(data.userId) : undefined;

    if (userId && this.activeClients.has(userId)) {
      this.activeClients.get(userId)?.delete(client.id);
      if (this.activeClients.get(userId)?.size === 0) {
        this.activeClients.delete(userId);
      }
    }
    console.log(`[WebSocket] Client disconnected: ${client.id}`);
  }

  /**
   * Send an event to all connected sockets of a specific user.
   */
  sendToUser(
    userId: string,
    event: string,
    payload: Record<string, unknown> | unknown,
  ): void {
    const socketIds = this.activeClients.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(event, payload);
      });
    }
  }
}
