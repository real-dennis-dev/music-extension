import React, { useEffect, useState } from "react";
import axios from "axios";
import Player from "./components/Player";

function App() {
  const [files, setFiles] = useState([]);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/files")
      .then(res => setFiles(res.data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🎵 Browser Media Player</h1>

      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <button onClick={() => setCurrent(file)}>
              {file}
            </button>
          </li>
        ))}
      </ul>

      {current && <Player file={current} />}
    </div>
  );
}

export default App;