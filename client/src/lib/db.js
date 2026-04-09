export function saveToDB(key, value) {
  const req = indexedDB.open("musicDB", 1);

  req.onupgradeneeded = () => {
    req.result.createObjectStore("store");
  };

  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction("store", "readwrite");
    tx.objectStore("store").put(value, key);
  };
}

export function getFromDB(key) {
  return new Promise((resolve) => {
    const req = indexedDB.open("musicDB", 1);

    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction("store", "readonly");
      const store = tx.objectStore("store");
      const getReq = store.get(key);

      getReq.onsuccess = () => resolve(getReq.result);
    };
  });
}