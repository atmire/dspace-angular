/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import { isPlatformBrowser } from '@angular/common';
import {
  Inject,
  Injectable,
  PLATFORM_ID,
} from '@angular/core';

import { hasValue } from '../../shared/empty.util';
import { ObjectCacheEntry } from '../cache/object-cache.reducer';
import { RequestEntry } from '../data/request-entry.model';
import { IndexName } from '../index/index-name.model';
import {
  cloneShareable,
  hasSharedCacheChanges,
  indexRecordKey,
  isShareableRequestEntry,
  isSensitiveCacheHref,
  objectCacheTimestamp,
  requestCacheTimestamp,
  SharedCacheDelta,
} from './shared-cache.model';

const DB_NAME = 'dspace-cross-tab-state';
const DB_VERSION = 2;
const OBJECTS_STORE = 'objects';
const REQUESTS_STORE = 'requests';
const INDEX_STORE = 'index';

interface IndexRecord {
  indexName: string;
  key: string;
  value: unknown;
  lastUpdated: number;
}

/**
 * Durable REST cache in IndexedDB. Three stores mirror the NgRx cache slices
 * incrementally. This is not a dump of the whole store.
 */
@Injectable({ providedIn: 'root' })
export class CrossTabStateStorageService {
  private dbPromise?: Promise<IDBDatabase>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
  }

  async applyDelta(delta: SharedCacheDelta): Promise<SharedCacheDelta> {
    if (!this.isAvailable() || !hasSharedCacheChanges(delta)) {
      return {};
    }

    const accepted: SharedCacheDelta = {
      objects: {},
      requests: {},
      index: {},
      deleteObjects: [],
      deleteRequests: [],
      deleteIndex: [],
    };

    const db = await this.openDb();
    const transaction = db.transaction([OBJECTS_STORE, REQUESTS_STORE, INDEX_STORE], 'readwrite');
    const objectsStore = transaction.objectStore(OBJECTS_STORE);
    const requestsStore = transaction.objectStore(REQUESTS_STORE);
    const indexStore = transaction.objectStore(INDEX_STORE);
    const transactionDone = this.transactionDone(transaction);

    const objectHrefs = Object.keys(delta.objects || {});
    const requestUuids = Object.keys(delta.requests || {});
    const indexPuts: { indexName: string; key: string; value: unknown }[] = [];
    Object.keys(delta.index || {}).forEach((indexName) => {
      Object.keys(delta.index[indexName] || {}).forEach((key) => {
        indexPuts.push({ indexName, key, value: delta.index[indexName][key] });
      });
    });

    const [existingObjects, existingRequests, existingIndex] = await Promise.all([
      Promise.all(objectHrefs.map((href) => this.requestDone<ObjectCacheEntry>(objectsStore.get(href)))),
      Promise.all(requestUuids.map((uuid) => this.requestDone<RequestEntry>(requestsStore.get(uuid)))),
      Promise.all(indexPuts.map((put) => this.requestDone<IndexRecord>(indexStore.get(indexRecordKey(put.indexName, put.key))))),
    ]);

    objectHrefs.forEach((href, i) => {
      const incoming = delta.objects[href];
      if (objectCacheTimestamp(incoming) > objectCacheTimestamp(existingObjects[i])) {
        const cloned = this.clone(incoming);
        objectsStore.put(cloned, href);
        accepted.objects[href] = cloned;
      }
    });
    (delta.deleteObjects || []).forEach((href) => {
      objectsStore.delete(href);
      accepted.deleteObjects.push(href);
    });

    requestUuids.forEach((uuid, i) => {
      const incoming = delta.requests[uuid];
      if (!isShareableRequestEntry(incoming)) {
        return;
      }
      if (requestCacheTimestamp(incoming) > requestCacheTimestamp(existingRequests[i])) {
        const cloned = this.clone(incoming);
        requestsStore.put(cloned, uuid);
        accepted.requests[uuid] = cloned;
      }
    });
    (delta.deleteRequests || []).forEach((uuid) => {
      requestsStore.delete(uuid);
      accepted.deleteRequests.push(uuid);
    });

    const now = Date.now();
    indexPuts.forEach((put, i) => {
      const existing = existingIndex[i];
      if (hasValue(existing) && existing.value === put.value) {
        return;
      }
      if (hasValue(existing) && now < (existing.lastUpdated || 0)) {
        return;
      }
      const record: IndexRecord = {
        indexName: put.indexName,
        key: put.key,
        value: put.value,
        lastUpdated: now,
      };
      indexStore.put(this.clone(record), indexRecordKey(put.indexName, put.key));
      accepted.index[put.indexName] = accepted.index[put.indexName] || {};
      accepted.index[put.indexName][put.key] = put.value;
    });
    (delta.deleteIndex || []).forEach((removal) => {
      indexStore.delete(indexRecordKey(removal.indexName, removal.key));
      accepted.deleteIndex.push(removal);
    });

    await transactionDone;
    return accepted;
  }

  async deleteIndexByValue(indexName: string, value: unknown): Promise<{ indexName: string; key: string }[]> {
    return this.deleteIndexRecords((record) => record.indexName === indexName && record.value === value);
  }

  async deleteIndexBySubstring(indexName: string, substring: string): Promise<{ indexName: string; key: string }[]> {
    return this.deleteIndexRecords((record) => record.indexName === indexName && record.key.indexOf(substring) >= 0);
  }

  async loadAll(): Promise<SharedCacheDelta> {
    if (!this.isAvailable()) {
      return {};
    }

    const delta: SharedCacheDelta = {
      objects: {},
      requests: {},
      index: {},
    };

    const objectKeys = await this.run<IDBValidKey[]>(OBJECTS_STORE, 'readonly', (store) => store.getAllKeys());
    const objectValues = await this.run<ObjectCacheEntry[]>(OBJECTS_STORE, 'readonly', (store) => store.getAll());
    (objectKeys || []).forEach((key, i) => {
      const href = String(key);
      if (!isSensitiveCacheHref(href)) {
        delta.objects[href] = objectValues[i];
      }
    });

    const requestKeys = await this.run<IDBValidKey[]>(REQUESTS_STORE, 'readonly', (store) => store.getAllKeys());
    const requestValues = await this.run<RequestEntry[]>(REQUESTS_STORE, 'readonly', (store) => store.getAll());
    (requestKeys || []).forEach((key, i) => {
      const entry = requestValues[i];
      if (isShareableRequestEntry(entry)) {
        delta.requests[String(key)] = entry;
      }
    });

    const indexRecords = await this.run<IndexRecord[]>(INDEX_STORE, 'readonly', (store) => store.getAll());
    (indexRecords || []).forEach((record) => {
      if (!hasValue(record) || isSensitiveCacheHref(record.key) || isSensitiveCacheHref(String(record.value))) {
        return;
      }
      if (record.indexName === IndexName.REQUEST && !hasValue(delta.requests[String(record.value)])) {
        return;
      }
      delta.index[record.indexName] = delta.index[record.indexName] || {};
      delta.index[record.indexName][record.key] = record.value;
    });

    return delta;
  }

  async clear(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }
    await this.run(OBJECTS_STORE, 'readwrite', (store) => store.clear());
    await this.run(REQUESTS_STORE, 'readwrite', (store) => store.clear());
    await this.run(INDEX_STORE, 'readwrite', (store) => store.clear());
  }

  private async deleteIndexRecords(shouldDelete: (record: IndexRecord) => boolean): Promise<{ indexName: string; key: string }[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const records = await this.run<IndexRecord[]>(INDEX_STORE, 'readonly', (store) => store.getAll()) || [];
    const deleted: { indexName: string; key: string }[] = [];
    for (const record of records) {
      if (hasValue(record) && shouldDelete(record)) {
        await this.run(INDEX_STORE, 'readwrite', (store) => store.delete(indexRecordKey(record.indexName, record.key)));
        deleted.push({ indexName: record.indexName, key: record.key });
      }
    }
    return deleted;
  }

  private isAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && typeof indexedDB !== 'undefined';
  }

  private clone<T>(value: T): T {
    return cloneShareable(value);
  }

  private requestDone<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private transactionDone(transaction: IDBTransaction): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  private run<T>(storeName: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('IndexedDB is not available'));
    }

    return this.openDb().then((db: IDBDatabase) => new Promise<T>((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, mode);
        const request = operation(transaction.objectStore(storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error: unknown) {
        reject(error);
      }
    }));
  }

  private openDb(): Promise<IDBDatabase> {
    if (hasValue(this.dbPromise)) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('state')) {
          db.deleteObjectStore('state');
        }
        if (!db.objectStoreNames.contains(OBJECTS_STORE)) {
          db.createObjectStore(OBJECTS_STORE);
        }
        if (!db.objectStoreNames.contains(REQUESTS_STORE)) {
          db.createObjectStore(REQUESTS_STORE);
        }
        if (!db.objectStoreNames.contains(INDEX_STORE)) {
          db.createObjectStore(INDEX_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.dbPromise = undefined;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }
}
