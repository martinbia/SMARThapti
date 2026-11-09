// Only FileSystemHandle references are stored here. File/Blob media bytes never
// enter IndexedDB, LocalStorage, or the service-worker cache.
const databaseName = "smarthapti-local-media-handles-v1";
const storeName = "handles";

function openDatabase(factory = globalThis.indexedDB) {
  if (!factory) return Promise.reject(new Error("IndexedDB is unavailable"));
  return new Promise((resolve, reject) => {
    const request = factory.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName))
        request.result.createObjectStore(storeName, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
    request.onblocked = () => reject(new Error("IndexedDB upgrade blocked"));
  });
}

async function transact(mode, operation) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      let result;
      try {
        result = operation(store);
      } catch (error) {
        reject(error);
        return;
      }
      transaction.oncomplete = () => resolve(result?.result);
      transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
      transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
    });
  } finally {
    db.close();
  }
}

export async function loadMediaHandles() {
  return (await transact("readonly", (store) => store.getAll())) || [];
}

export async function saveDirectoryHandle(handle) {
  if (!handle || handle.kind !== "directory") throw new Error("Invalid directory handle");
  await transact("readwrite", (store) => store.put({ id: "directory", handle }));
}

export async function saveFileHandles(handles) {
  await transact("readwrite", (store) => {
    for (const handle of handles) {
      if (handle?.kind !== "file" || typeof handle.name !== "string") continue;
      store.put({ id: `file:${handle.name}`, name: handle.name, handle });
    }
  });
}

export async function queryReadPermission(handle) {
  if (typeof handle?.queryPermission !== "function") return "unsupported";
  try {
    const permission = await handle.queryPermission({ mode: "read" });
    return permission === "granted" || permission === "prompt" || permission === "denied"
      ? permission
      : "unsupported";
  } catch {
    return "denied";
  }
}

export async function requestReadPermission(handle) {
  if (typeof handle?.requestPermission !== "function") return "unsupported";
  try {
    const permission = await handle.requestPermission({ mode: "read" });
    return permission === "granted" || permission === "prompt" || permission === "denied"
      ? permission
      : "unsupported";
  } catch {
    return "denied";
  }
}
