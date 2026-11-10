const databaseName = "smarthapti-persistent-local-videos-v1";
const storeName = "videos";
const opfsDirectoryName = "smarthapti-private-video-library-v1";
const chunkSize = 1024 * 1024;

function openDatabase() {
  if (!globalThis.indexedDB) return Promise.reject(new Error("IndexedDBUnavailable"));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName))
        request.result.createObjectStore(storeName, { keyPath: "mediaId" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDBOpenFailed"));
    request.onblocked = () => reject(new Error("IndexedDBBlocked"));
  });
}

async function transaction(mode, operation) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      let request;
      try {
        request = operation(tx.objectStore(storeName));
      } catch (error) {
        reject(error);
        return;
      }
      tx.oncomplete = () => resolve(request?.result);
      tx.onerror = () => reject(tx.error || new Error("IndexedDBTransactionFailed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDBTransactionAborted"));
    });
  } finally {
    db.close();
  }
}

function readRecord(mediaId) {
  return transaction("readonly", (store) => store.get(mediaId));
}

function writeRecord(record) {
  return transaction("readwrite", (store) => store.put(record));
}

function deleteRecord(mediaId) {
  return transaction("readwrite", (store) => store.delete(mediaId));
}

export function listLocalVideoRecords() {
  return transaction("readonly", (store) => store.getAll());
}

export async function storageEstimate() {
  if (typeof navigator.storage?.estimate !== "function") return null;
  try {
    const { usage, quota } = await navigator.storage.estimate();
    return {
      usage: Number.isFinite(usage) ? usage : null,
      quota: Number.isFinite(quota) ? quota : null,
      available: Number.isFinite(usage) && Number.isFinite(quota)
        ? Math.max(0, quota - usage)
        : null,
    };
  } catch {
    return null;
  }
}

export async function requestPersistentStorage() {
  if (typeof navigator.storage?.persisted !== "function") return "unsupported";
  try {
    if (await navigator.storage.persisted()) return "granted";
    if (typeof navigator.storage.persist !== "function") return "unsupported";
    return (await navigator.storage.persist()) ? "granted" : "not-granted";
  } catch {
    return "failed";
  }
}

async function openOpfsDirectory(create = false) {
  if (typeof navigator.storage?.getDirectory !== "function") return null;
  try {
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle(opfsDirectoryName, { create });
  } catch (error) {
    if (["NotSupportedError", "SecurityError"].includes(error?.name)) return null;
    throw error;
  }
}

function typeFromName(name) {
  const extension = name.split(".").pop().toLowerCase();
  return extension === "webm" ? "video/webm" : "video/mp4";
}

async function validateVideo(file, name) {
  if (!file || !Number.isFinite(file.size) || file.size <= 0)
    throw new Error("EmptyVideo");
  const extension = name.split(".").pop().toLowerCase();
  if (!new Set(["mp4", "m4v", "webm"]).has(extension))
    throw new Error("UnsupportedVideoType");
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (start, end) => String.fromCharCode(...header.slice(start, end));
  if ((extension === "mp4" || extension === "m4v") && ascii(4, 8) !== "ftyp")
    throw new Error("InvalidMp4Container");
  if (extension === "webm" && (header[0] !== 0x1a || header[1] !== 0x45 || header[2] !== 0xdf || header[3] !== 0xa3))
    throw new Error("InvalidWebmContainer");
}

function token() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mayUseIndexedDbFallback(error) {
  return ["NotSupportedError", "SecurityError", "QuotaExceededError", "InvalidStateError"].includes(error?.name);
}

async function writeOpfsFile(directory, objectName, file, onProgress) {
  const handle = await directory.getFileHandle(objectName, { create: true });
  const writable = await handle.createWritable({ keepExistingData: false });
  let written = 0;
  try {
    if (typeof file.stream === "function") {
      const reader = file.stream().getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writable.write(value);
          written += value.byteLength;
          onProgress?.(written, file.size);
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      for (let offset = 0; offset < file.size; offset += chunkSize) {
        const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer();
        await writable.write(chunk);
        written += chunk.byteLength;
        onProgress?.(written, file.size);
      }
    }
    await writable.close();
  } catch (error) {
    try { await writable.abort(); } catch {}
    try { await directory.removeEntry(objectName); } catch {}
    throw error;
  }
  const saved = await handle.getFile();
  if (written !== file.size || saved.size !== file.size) {
    try { await directory.removeEntry(objectName); } catch {}
    throw new Error("VideoSizeMismatch");
  }
  try {
    await validateVideo(saved, file.name);
  } catch (error) {
    try { await directory.removeEntry(objectName); } catch {}
    throw error;
  }
}

function makeRecord(mediaId, file, backend, extra = {}) {
  return {
    mediaId,
    fileName: file.name,
    size: file.size,
    type: typeFromName(file.name),
    lastModified: Number(file.lastModified) || 0,
    storedAt: new Date().toISOString(),
    backend,
    ...extra,
  };
}

export async function saveLocalVideo(mediaId, file, onProgress) {
  if (!/^M-P-EX-10[1-7]$/.test(mediaId)) throw new Error("UnsupportedVideoMediaId");
  await validateVideo(file, file?.name || "");
  const previous = await readRecord(mediaId);
  let directory = null;
  try {
    directory = await openOpfsDirectory(true);
  } catch (error) {
    if (!mayUseIndexedDbFallback(error)) throw error;
  }
  if (directory) {
    const objectName = `${mediaId}-${token()}.media`;
    try {
      await writeOpfsFile(directory, objectName, file, onProgress);
      const record = makeRecord(mediaId, file, "opfs", { objectName });
      try {
        await writeRecord(record);
      } catch (error) {
        try { await directory.removeEntry(objectName); } catch {}
        throw error;
      }
      if (previous?.backend === "opfs" && previous.objectName) {
        try { await directory.removeEntry(previous.objectName); } catch {}
      }
      return record;
    } catch (error) {
      if (!mayUseIndexedDbFallback(error)) throw error;
      try { await directory.removeEntry(objectName); } catch {}
    }
  }

  // Blob-in-IndexedDB fallback is used only when OPFS is absent/unsupported.
  const previousFallback = previous || null;
  const record = { ...makeRecord(mediaId, file, "indexeddb"), blob: file.slice(0, file.size, typeFromName(file.name)) };
  await writeRecord(record);
  try {
    const saved = await readRecord(mediaId);
    if (!(saved?.blob instanceof Blob) || saved.blob.size !== file.size)
      throw new Error("VideoVerificationFailed");
    await validateVideo(saved.blob, file.name);
  } catch (error) {
    if (previousFallback) await writeRecord(previousFallback);
    else await deleteRecord(mediaId);
    throw error;
  }
  if (previous?.backend === "opfs" && previous.objectName) {
    try { await directory?.removeEntry(previous.objectName); } catch {}
  }
  onProgress?.(file.size, file.size);
  return { ...record, blob: undefined };
}

export async function loadLocalVideo(mediaId) {
  const record = await readRecord(mediaId);
  if (!record) return { record: null, file: null, error: "" };
  try {
    let stored;
    if (record.backend === "opfs") {
      const directory = await openOpfsDirectory(false);
      if (!directory) throw new Error("OpfsUnavailable");
      const handle = await directory.getFileHandle(record.objectName);
      stored = await handle.getFile();
    } else if (record.backend === "indexeddb") {
      stored = record.blob;
    } else throw new Error("UnknownStorageBackend");
    if (!(stored instanceof Blob) || stored.size !== record.size)
      throw new Error("StoredVideoIncomplete");
    await validateVideo(stored, record.fileName);
    const file = new File([stored], record.fileName, {
      type: record.type || typeFromName(record.fileName),
      lastModified: record.lastModified || Date.now(),
    });
    return { record: { ...record, blob: undefined }, file, error: "" };
  } catch (error) {
    return { record: { ...record, blob: undefined }, file: null, error: error?.name && error.name !== "Error" ? error.name : error?.message || "StoredVideoUnreadable" };
  }
}

export async function removeLocalVideo(mediaId) {
  const record = await readRecord(mediaId);
  if (!record) return false;
  if (record.backend === "opfs" && record.objectName) {
    const directory = await openOpfsDirectory(false);
    if (directory) {
      try {
        await directory.removeEntry(record.objectName);
      } catch (error) {
        if (error?.name !== "NotFoundError") throw error;
      }
    }
  }
  await deleteRecord(mediaId);
  return true;
}

export async function localVideoStoredBytes() {
  const records = await listLocalVideoRecords();
  return records.reduce((total, record) => total + (Number(record.size) || 0), 0);
}
