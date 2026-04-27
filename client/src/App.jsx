import { useEffect, useState } from "react";
import Player from "./components/Player";
import { save, load } from "./lib/chromeStorage";

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [tab, setTab] = useState("audio");
  const [current, setCurrent] = useState(null);

  const [queue, setQueue] = useState([]);
  const [playlists, setPlaylists] = useState({});
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const [dir, setDir] = useState("");

  // 🔁 LOAD STATE
  useEffect(() => {
    (async () => {
      const savedDir = await load("dir");
      const savedPlaylists = (await load("playlists")) || {};
      const savedQueue = (await load("queue")) || [];

      setPlaylists(savedPlaylists);
      setQueue(savedQueue);

      const defaultDir =
        savedDir ||
        "C:/Users/Administrator/Downloads/DJ-Video-Mixes";

      setDir(defaultDir);
      scan(defaultDir);
    })();
  }, []);

  // 💾 persist queue + playlists
  useEffect(() => {
    save("queue", queue);
  }, [queue]);

  useEffect(() => {
    save("playlists", playlists);
  }, [playlists]);

  // 📂 scan folder
  async function scan(folder) {
    const res = await fetch(
      `http://localhost:3001/scan?dir=${encodeURIComponent(folder)}`
    );
    const data = await res.json();
    setTracks(data);
  }

  // 📁 select folder
  function selectFolder() {
    const folder = prompt("Enter folder path:");
    if (!folder) return;

    setDir(folder);
    save("dir", folder);
    scan(folder);
  }

  // =========================
  // 🎶 QUEUE SYSTEM
  // =========================

  function addToQueue(track) {
    setQueue((q) => [...q, track]);
  }

  function removeFromQueue(i) {
    setQueue((q) => q.filter((_, idx) => idx !== i));
  }

  function playFromQueue(i) {
  setCurrent(queue[i]); // autoplay happens in Player
}

  function playNext() {
    if (queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
  }

  function playPrevious() {
  if (queue.length === 0) return;

  setQueue((q) => {
    const last = q[q.length - 1];
    return q.slice(0, -1);
  });

  setCurrent(queue[queue.length - 1]);
}

  // =========================
  // 📃 PLAYLIST SYSTEM
  // =========================

  function createPlaylist() {
    const name = prompt("Playlist name:");
    if (!name) return;

    setPlaylists((p) => ({ ...p, [name]: [] }));
  }

  function addToPlaylist(name, track) {
    setPlaylists((p) => ({
      ...p,
      [name]: [...p[name], track]
    }));
  }

  function removeFromPlaylist(name, index) {
    setPlaylists((p) => ({
      ...p,
      [name]: p[name].filter((_, i) => i !== index)
    }));
  }

  // =========================

  const filtered = tracks.filter((t) => t.type === tab);

  return (
    <div className="flex h-screen bg-black text-white">

      {/* ================= SIDEBAR ================= */}
      <div className="w-1/4 p-4 border-r border-gray-800 flex flex-col">

        {/* Folder */}
        <button
          onClick={selectFolder}
          className="mb-3 bg-green-600 p-2 rounded"
        >
          📂 Select Folder
        </button>

        <p className="text-xs text-gray-400 mb-2">{dir}</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTab("audio")}
            className={tab === "audio" ? "text-green-500" : ""}
          >
            🎵 Music
          </button>
          <button
            onClick={() => setTab("video")}
            className={tab === "video" ? "text-green-500" : ""}
          >
            🎬 Video
          </button>
        </div>

        {/* Tracks */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((t, i) => (
            <div key={i} className="p-2 hover:bg-gray-800 rounded">
              <p onClick={() => setCurrent(t)}>{t.title}</p>

              <div className="flex gap-2 text-xs">
                <button onClick={() => addToQueue(t)}>➕ Queue</button>

                {Object.keys(playlists).map((name) => (
                  <button
                    key={name}
                    onClick={() => addToPlaylist(name, t)}
                  >
                    ➕ {name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* PLAYLISTS */}
        <div className="mt-4 border-t border-gray-700 pt-2">
          <h3 className="mb-2">📃 Playlists</h3>

          <button
            onClick={createPlaylist}
            className="text-sm mb-2 bg-gray-700 px-2 py-1 rounded"
          >
            + New
          </button>

          {Object.keys(playlists).map((name) => (
            <div key={name}>
              <p
                onClick={() => setSelectedPlaylist(name)}
                className="cursor-pointer hover:text-green-400"
              >
                {name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">

       <Player
  track={current}
  onEnd={playNext}
  onNext={playNext}
  onPrev={playPrevious}
/>

        {/* PLAYLIST VIEW */}
        {selectedPlaylist && (
          <div className="p-4 border-t border-gray-800">
            <h2>{selectedPlaylist}</h2>

            {playlists[selectedPlaylist].map((t, i) => (
              <div key={i} className="flex justify-between">
                <span onClick={() => setCurrent(t)}>
                  {t.title}
                </span>

                <button
                  onClick={() =>
                    removeFromPlaylist(selectedPlaylist, i)
                  }
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}

        {/* QUEUE */}
        <div className="p-4 border-t border-gray-800">
          <h2>🎶 Queue</h2>

          {queue.map((q, i) => (
            <div key={i} className="flex justify-between">
              <span onClick={() => playFromQueue(i)}>
                {q.title}
              </span>

              <button onClick={() => removeFromQueue(i)}>
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}