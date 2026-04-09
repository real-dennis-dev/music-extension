// client/src/lib/chromeStorage.js
export const save = (key, value) =>
  chrome.storage.local.set({ [key]: value });

export const load = (key) =>
  new Promise((res) => {
    chrome.storage.local.get([key], (result) => {
      res(result[key]);
    });
  });