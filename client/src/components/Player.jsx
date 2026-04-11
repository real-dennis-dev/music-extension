import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function Player({ track }) {
  const waveRef = useRef(null);
  const wsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 🎵 load track
  useEffect(() => {
    if (!track || track.type === "video") return;

    if (wsRef.current) wsRef.current.destroy();

    const ws = WaveSurfer.create({
      container: waveRef.current,
      waveColor: "#444",
      progressColor: "#1db954",
      cursorColor: "#1db954",
      barWidth: 2,
      height: 100,
      responsive: true
    });

    ws.load(`http://localhost:3001/media?path=${encodeURIComponent(track.path)}`);

    ws.on("ready", () => {
      setDuration(ws.getDuration());
    });

    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("seek", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    wsRef.current = ws;

    return () => ws.destroy();
  }, [track]);

  // 🎹 keyboard controls
  useEffect(() => {
    function handleKey(e) {
      if (!wsRef.current) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }

      if (e.code === "ArrowRight") {
        wsRef.current.seekTo(
          (wsRef.current.getCurrentTime() + 5) / duration
        );
      }

      if (e.code === "ArrowLeft") {
        wsRef.current.seekTo(
          (wsRef.current.getCurrentTime() - 5) / duration
        );
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [duration]);

  function togglePlay() {
    wsRef.current.playPause();
    setIsPlaying(wsRef.current.isPlaying());
  }

  function formatTime(sec) {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  if (!track) return <div className="p-6">Select media</div>;

  return (
    <div className="p-6">

      <h2 className="text-xl mb-2">{track.title}</h2>

      {track.type === "audio" ? (
        <>
          {/* Album Art */}
          {track.picture && (
            <img
              src={`data:image/jpeg;base64,${track.picture}`}
              className="w-40 mb-4 rounded shadow-lg"
            />
          )}

          {/* Waveform */}
          <div ref={waveRef} className="mb-4"></div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                wsRef.current.seekTo(
                  (currentTime - 5) / duration
                )
              }
            >
              ⏪
            </button>

            <button
              onClick={togglePlay}
              className="bg-green-500 px-4 py-2 rounded"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>

            <button
              onClick={() =>
                wsRef.current.seekTo(
                  (currentTime + 5) / duration
                )
              }
            >
              ⏩
            </button>
          </div>

          {/* Time */}
          <div className="mt-2 text-sm text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)} (
            -{formatTime(duration - currentTime)})
          </div>
        </>
      ) : (
        <video
          controls
          className="w-full mt-4"
          src={`http://localhost:3001/media?path=${encodeURIComponent(track.path)}`}
        />
      )}
    </div>
  );
}