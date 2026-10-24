import { useEffect, useRef } from 'react';
import signalRService from '../services/signalRService';

/**
 * Dev-only helpers for testing a full session in a single browser window.
 *
 * Open http://localhost:3000/?dev to get a harness that renders the host and
 * several players side by side in iframes. Each iframe is loaded with
 * `?slot=<id>` plus auto-join params, gets its own SignalR connection and
 * skips localStorage persistence so the slots don't overwrite each other.
 */

const params = import.meta.env.DEV ? new URLSearchParams(window.location.search) : new URLSearchParams();

export const DEV_ROOM_MESSAGE = 'quartermark-dev:room';
export const DEV_DROP_MESSAGE = 'quartermark-dev:drop';

/** True when the dev harness page itself should render. */
export const isDevHarness = import.meta.env.DEV && params.has('dev');

/** Slot id when running inside the harness (e.g. "host", "p1"), otherwise null. */
export const devSlot: string | null = import.meta.env.DEV ? params.get('slot') : null;

/** Auto-create a room with this host name. */
export const devHostName: string | null = devSlot ? params.get('host') : null;

/** Auto-join this room code with `devPlayerName`. */
export const devRoomCode: string | null = devSlot ? params.get('room') : null;
export const devPlayerName: string | null = devSlot ? params.get('name') : null;

// Module-level guard so React StrictMode's double effect run doesn't create/join twice
let autoStarted = false;

export function useDevHostAutoCreate(
  isConnected: boolean,
  roomCode: string,
  createRoom: (name: string) => Promise<void>
) {
  useEffect(() => {
    if (!devHostName || autoStarted || isConnected) return;
    autoStarted = true;
    createRoom(devHostName).catch((e) => console.error('[dev] auto-create failed', e));
  }, [isConnected, createRoom]);

  // Tell the harness which room was created so it can point the player iframes at it
  const lastPosted = useRef('');
  useEffect(() => {
    if (!devSlot || !roomCode || roomCode === lastPosted.current || window.parent === window) return;
    lastPosted.current = roomCode;
    window.parent.postMessage({ type: DEV_ROOM_MESSAGE, roomCode }, window.location.origin);
  }, [roomCode]);
}

export function useDevPlayerAutoJoin(
  isConnected: boolean,
  joinRoom: (code: string, name: string) => Promise<{ rejoined?: boolean } | undefined>,
  setPlayerName: (name: string) => void,
  setRoomCodeInput: (code: string) => void,
  onRejoined: () => Promise<void>
) {
  useEffect(() => {
    if (!devRoomCode || !devPlayerName || autoStarted || isConnected) return;
    autoStarted = true;
    setPlayerName(devPlayerName);
    setRoomCodeInput(devRoomCode);
    joinRoom(devRoomCode, devPlayerName)
      // A reloaded slot takes its old seat back by name; catch up like a reconnect does
      .then((result) => (result?.rejoined ? onRejoined() : undefined))
      .catch((e) => console.error('[dev] auto-join failed', e));
  }, [isConnected, joinRoom, setPlayerName, setRoomCodeInput, onRejoined]);
}

// The harness can simulate a locked phone screen: drop this slot's connection for a while
if (devSlot) {
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || event.data?.type !== DEV_DROP_MESSAGE) return;
    signalRService.simulateConnectionLoss(Number(event.data.ms) || 10000);
  });
}
