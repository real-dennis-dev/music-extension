import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function Player({ track }) {
  const waveRef = useRef(null);

  useEffect(() => {
    if (!track || track.type === "video") return;

    const ws = WaveSurfer.create({
      container: waveRef.current,
      waveColor: "#555",
      progressColor: "#1db954",
      height: 80
    });

    ws.load(`http://localhost:3001/media?path=${encodeURIComponent(track.path)}`);

    return () => ws.destroy();
  }, [track]);

  if (!track) return <div className="p-6">Select media</div>;

  return (
    <div className="p-6">

      <h2 className="text-xl">{track.title}</h2>

      {track.type === "audio" ? (
        <>
          {track.picture && (
            <img
              src={`data:image/jpeg;base64,${track.picture}`}
              className="w-40 mb-4"
            />
          )}

          <div ref={waveRef}></div>

          <audio
            controls
            className="w-full mt-4"
            src={`http://localhost:3001/media?path=${encodeURIComponent(track.path)}`}
          />
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