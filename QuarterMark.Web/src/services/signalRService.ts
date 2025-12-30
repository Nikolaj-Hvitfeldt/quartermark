import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

type ListenerCallback = (...args: any[]) => void;

class SignalRService {
  private connection: HubConnection | null = null;
  private listeners: Map<string, ListenerCallback[]> = new Map();

  async connect(url?: string): Promise<HubConnection> {
    if (this.connection?.state === 'Connected') {
      return this.connection;
    }

    const apiUrl = url || import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const hubUrl = `${apiUrl}/gamehub`;

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    // Re-register all listeners when reconnecting
    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
    });

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.reregisterListeners();
    });

    await this.connection.start();
    this.reregisterListeners();
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.listeners.clear();
      await this.connection.stop();
      this.connection = null;
    }
  }

  on(method: string, callback: ListenerCallback): void {
    if (!this.connection) {
      throw new Error('Connection not established. Call connect() first.');
    }

    this.connection.on(method, callback);
    
    // Store listener for reconnection
    if (!this.listeners.has(method)) {
      this.listeners.set(method, []);
    }
    this.listeners.get(method)!.push(callback);
  }

  off(method: string, callback: ListenerCallback): void {
    if (this.connection) {
      this.connection.off(method, callback);
    }

    // Remove from stored listeners
    if (this.listeners.has(method)) {
      const callbacks = this.listeners.get(method)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  async invoke(method: string, ...args: any[]): Promise<any> {
    if (!this.connection || this.connection.state !== 'Connected') {
      throw new Error('Connection not established or not connected');
    }
    return await this.connection.invoke(method, ...args);
  }

  private reregisterListeners(): void {
    for (const [method, callbacks] of this.listeners.entries()) {
      callbacks.forEach(callback => {
        this.connection!.off(method);
        this.connection!.on(method, callback);
      });
    }
  }

  getConnection(): HubConnection | null {
    return this.connection;
  }
}

export default new SignalRService();

