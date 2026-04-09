import { useEffect, useState } from "react";
import Player from "./components/Player";
import { save, load } from "./lib/chromeStorage";

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [tab, setTab] = useState("audio");
  const [current, setCurrent] = useState(null);
  const [queue, setQueue] = useState([]);
  const [playlists, setPlaylists] = useState({});
  const [dir, setDir] = useState("");

  // 🔁 load saved data
  useEffect(() => {
    (async () => {
      const savedDir = await load("dir");
      const savedPlaylists = await load("playlists") || {};
      setPlaylists(savedPlaylists);

      if (savedDir) {
        setDir(savedDir);
        scan(savedDir);
      }
    })();
  }, []);

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

  // ➕ queue
  function addToQueue(track) {
    setQueue((q) => [...q, track]);
  }

  // ➖ remove queue
  function removeFromQueue(i) {
    setQueue((q) => q.filter((_, idx) => idx !== i));
  }

  const filtered = tracks.filter((t) => t.type === tab);

  return (
    <div className="flex h-screen bg-black text-white">

      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r border-gray-800">
        <button onClick={selectFolder} className="mb-4 bg-green-600 p-2 rounded">
          Select Folder
        </button>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("audio")} className={tab==="audio"?"text-green-500":""}>Music</button>
          <button onClick={() => setTab("video")} className={tab==="video"?"text-green-500":""}>Video</button>
        </div>

        <div className="overflow-y-auto h-[70vh]">
          {filtered.map((t, i) => (
            <div key={i} className="p-2 hover:bg-gray-800 rounded">
              <p onClick={() => setCurrent(t)}>{t.title}</p>
              <button onClick={() => addToQueue(t)}>➕ Queue</button>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        <Player track={current} />

        {/* Queue */}
        <div className="p-4 border-t border-gray-800">
          <h2>Queue</h2>
          {queue.map((q, i) => (
            <div key={i} className="flex justify-between">
              <span>{q.title}</span>
              <button onClick={() => removeFromQueue(i)}>❌</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}