import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

type ListenerCallback = (...args: any[]) => void;

// Phones drop the socket when the screen locks or the tab is in the background,
// so never give up reconnecting: retry fast first, then every few seconds.
const RETRY_DELAYS_MS = [0, 1000, 2000, 5000];
const RESTART_INTERVAL_MS = 3000;

class SignalRService {
  private connection: HubConnection | null = null;
  private listeners: Map<string, ListenerCallback[]> = new Map();
  private intentionalStop = false;
  private restarting = false;
  private pausedUntil = 0;

  constructor() {
    // Coming back to the tab or unlocking the phone: reconnect right away instead of
    // waiting for the next retry tick (timers are throttled while the page is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.connection?.state === HubConnectionState.Disconnected) {
        this.restartUntilConnected();
      }
    });
    window.addEventListener('online', () => {
      if (this.connection?.state === HubConnectionState.Disconnected) {
        this.restartUntilConnected();
      }
    });
  }

  async connect(url?: string): Promise<HubConnection> {
    if (this.connection?.state === 'Connected') {
      return this.connection;
    }

    const apiUrl = url || import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const hubUrl = `${apiUrl}/gamehub`;

    this.intentionalStop = false;
    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (ctx) =>
          RETRY_DELAYS_MS[Math.min(ctx.previousRetryCount, RETRY_DELAYS_MS.length - 1)],
      })
      // Notice a dead socket quickly after unlock (server keep-alive is 5s)
      .withServerTimeout(15000)
      .withKeepAliveInterval(5000)
      .build();

    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
    });

    // Listeners stay attached to the HubConnection across reconnects, so there is
    // nothing to re-register here; components rejoin the room on this event.
    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected', connectionId);
      window.dispatchEvent(new CustomEvent('signalr-reconnected'));
    });

    // Automatic reconnect can still end in a closed connection (e.g. the page was frozen
    // long enough for the attempt to fail). Keep trying unless we stopped on purpose.
    this.connection.onclose(() => {
      if (!this.intentionalStop) {
        this.restartUntilConnected();
      }
    });

    await this.connection.start();
    this.reregisterListeners();
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.intentionalStop = true;
      this.listeners.clear();
      await this.connection.stop();
      this.connection = null;
    }
  }

  /**
   * Dev only: drop the connection as if the phone locked its screen, and stay offline
   * for `ms` before the normal reconnect logic kicks in.
   */
  async simulateConnectionLoss(ms: number): Promise<void> {
    if (!import.meta.env.DEV || !this.connection) return;
    this.pausedUntil = Date.now() + ms;
    await this.connection.stop();
  }

  on(method: string, callback: ListenerCallback): void {
    if (!this.connection) {
      throw new Error('Connection not established. Call connect() first.');
    }

    this.connection.on(method, callback);

    // Store listener so it can be attached to a new connection object
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

  private async restartUntilConnected(): Promise<void> {
    if (this.restarting) return;
    this.restarting = true;
    try {
      while (this.connection && !this.intentionalStop && this.connection.state === HubConnectionState.Disconnected) {
        const pause = this.pausedUntil - Date.now();
        await new Promise((resolve) => setTimeout(resolve, pause > 0 ? pause : RESTART_INTERVAL_MS));
        if (!this.connection || this.intentionalStop || this.connection.state !== HubConnectionState.Disconnected) {
          break;
        }
        try {
          await this.connection.start();
          console.log('SignalR connection restarted');
          window.dispatchEvent(new CustomEvent('signalr-reconnected'));
        } catch (error) {
          console.log('SignalR restart failed, retrying...', error);
        }
      }
    } finally {
      this.restarting = false;
    }
  }

  private reregisterListeners(): void {
    // Detach each method once, then attach every stored callback. (Detaching inside the
    // per-callback loop used to leave only the last callback of each method attached.)
    for (const [method, callbacks] of this.listeners.entries()) {
      this.connection!.off(method);
      callbacks.forEach(callback => this.connection!.on(method, callback));
    }
  }

  getConnection(): HubConnection | null {
    return this.connection;
  }
}

export default new SignalRService();
