const DB_NAME = "webviewer-storage";
const STORE_NAME = "pdf-data";
const PDF_KEY = "saved-pdf";
const XFDF_KEY = "saved-xfdf";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function put(db: IDBDatabase, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function get<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

function clear(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function savePdfToIndexedDB(
  pdfBlob: Blob,
  xfdfString: string,
): Promise<void> {
  const db = await openDB();
  await put(db, PDF_KEY, pdfBlob);
  await put(db, XFDF_KEY, xfdfString);
  db.close();
}

export async function loadPdfFromIndexedDB(): Promise<{
  pdf: Blob;
  xfdf: string;
} | null> {
  const db = await openDB();
  const pdf = await get<Blob>(db, PDF_KEY);
  const xfdf = await get<string>(db, XFDF_KEY);
  db.close();
  if (!pdf) return null;
  return { pdf, xfdf: xfdf ?? "" };
}

export async function clearIndexedDB(): Promise<void> {
  const db = await openDB();
  await clear(db);
  db.close();
}
