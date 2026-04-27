import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function Player({ track }) {
  const waveRef = useRef(null);
  const wsRef = useRef(null);
const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [hoverTime, setHoverTime] = useState(null);
const [hoverX, setHoverX] = useState(0);
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

  ws.play();                 // ✅ autoplay
  setIsPlaying(true);        // sync state
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

  //Mouse Effects
  useEffect(() => {
  if (!wsRef.current) return;

  const container = waveRef.current;

  function handleMove(e) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;

    const time = percent * duration;

    setHoverTime(time);
    setHoverX(x);
  }

  function leave() {
    setHoverTime(null);
  }

  container.addEventListener("mousemove", handleMove);
  container.addEventListener("mouseleave", leave);

  return () => {
    container.removeEventListener("mousemove", handleMove);
    container.removeEventListener("mouseleave", leave);
  };
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
          <div className="relative">
          <div ref={waveRef} className="mb-4"></div>
          {hoverTime !== null && (
              <div
                className="absolute bg-black text-white text-xs px-2 py-1 rounded"
                style={{
                  left: hoverX,
                  top: -20
                }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={onPrev}>⏮</button>
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
            <button onClick={onNext}>⏭</button>
          </div>

          {/* Time */}
          <div className="mt-2 text-sm text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)} (
            -{formatTime(duration - currentTime)})
          </div>
        </>
      ) : (
        <>
        <video
  ref={videoRef}
  className="w-full mt-4"
  src={`http://localhost:3001/media?path=${encodeURIComponent(track.path)}`}
/>

<div className="flex gap-3 mt-2">
  <button onClick={onPrev}>⏮</button>

  <button onClick={() => videoRef.current.currentTime -= 5}>
    ⏪
  </button>

  <button onClick={() => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }}>
    ▶ / ⏸
  </button>

  <button onClick={() => videoRef.current.currentTime += 5}>
    ⏩
  </button>

  <button onClick={onNext}>⏭</button>
</div> </>
      )}
    </div>
  );
}