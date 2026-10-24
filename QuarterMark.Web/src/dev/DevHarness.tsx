import { useEffect, useState } from 'react';
import { DEV_DROP_MESSAGE, DEV_ROOM_MESSAGE } from './devMode';
import './DevHarness.css';

const PLAYER_NAMES = ['Anna', 'Bo', 'Carl', 'Dina', 'Emil', 'Freja'];
const ZOOM_OPTIONS = [1, 0.85, 0.7, 0.55];
const LOCK_DURATION_MS = 10000;

const readNumberParam = (key: string, fallback: number) => {
  const value = Number(new URLSearchParams(window.location.search).get(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

/**
 * Dev-only page: host + N players in iframes, all in one browser window.
 * Each iframe is a separate app instance with its own SignalR connection.
 */
function DevHarness() {
  const [playerCount, setPlayerCount] = useState(() => Math.min(readNumberParam('players', 3), PLAYER_NAMES.length));
  const [zoom, setZoom] = useState(() => readNumberParam('zoom', 0.7));
  const [roomCode, setRoomCode] = useState('');
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === DEV_ROOM_MESSAGE && typeof event.data.roomCode === 'string') {
        setRoomCode(event.data.roomCode);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const restart = () => {
    setRoomCode('');
    setRunId((id) => id + 1);
  };

  // Simulate a locked phone screen / backgrounded tab: the slot drops its connection and
  // stays offline for a while before its normal reconnect logic kicks in
  const lockSlot = (title: string) => {
    const frame = document.querySelector<HTMLIFrameElement>(`iframe[title="${title}"]`);
    frame?.contentWindow?.postMessage({ type: DEV_DROP_MESSAGE, ms: LOCK_DURATION_MS }, window.location.origin);
  };

  const lockButton = (title: string) => (
    <button className="dev-lock" onClick={() => lockSlot(title)} title={`Drop connection for ${LOCK_DURATION_MS / 1000}s`}>
      📴 Lock
    </button>
  );

  const hostSrc = `/?slot=host&host=Host`;
  const playerSrc = (name: string, index: number) =>
    `/?slot=p${index + 1}&room=${encodeURIComponent(roomCode)}&name=${encodeURIComponent(name)}`;

  const frameStyle = { zoom, width: `${100 / zoom}%`, height: `${100 / zoom}%` };
  const players = PLAYER_NAMES.slice(0, playerCount);

  return (
    <div className="dev-harness">
      <header className="dev-toolbar">
        <strong>🧪 QuarterMark dev harness</strong>
        <span className="dev-room">Room: {roomCode || '…'}</span>
        <label>
          Players
          <select
            value={playerCount}
            onChange={(e) => {
              setPlayerCount(Number(e.target.value));
              restart();
            }}
          >
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          Zoom
          <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>
            {ZOOM_OPTIONS.map((z) => (
              <option key={z} value={z}>{Math.round(z * 100)}%</option>
            ))}
          </select>
        </label>
        <button className="dev-restart" onClick={restart}>↻ New room</button>
      </header>

      <div className="dev-grid">
        <section className="dev-pane dev-pane-host">
          <div className="dev-pane-label">
            Host (TV) <span>{lockButton('Host')} <a href={hostSrc} target="_blank" rel="noreferrer">open ↗</a></span>
          </div>
          <div className="dev-frame-wrap">
            <iframe key={`host-${runId}`} src={hostSrc} title="Host" style={frameStyle} />
          </div>
        </section>

        <div className="dev-players">
          {players.map((name, index) => (
            <section key={name} className="dev-pane dev-pane-player">
              <div className="dev-pane-label">{name} (phone) {roomCode && lockButton(name)}</div>
              <div className="dev-frame-wrap">
                {roomCode ? (
                  <iframe
                    key={`${name}-${roomCode}-${runId}`}
                    src={playerSrc(name, index)}
                    title={name}
                    style={frameStyle}
                  />
                ) : (
                  <div className="dev-waiting">Waiting for host to create a room…</div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DevHarness;
