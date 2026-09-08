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

const DB_NAME = 'dspace-cross-tab-state';
const STORE_NAME = 'state';
const DB_VERSION = 1;

/**
 * Temporary IndexedDB home for a shareable NgRx cache snapshot during a
 * cross-tab handshake. Data is keyed by request id and deleted after use;
 * this is not a persistent store.
 */
@Injectable({ providedIn: 'root' })
export class CrossTabStateStorageService {
  private dbPromise?: Promise<IDBDatabase>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
  }

  /**
   * Store a JSON-serializable snapshot under the handshake request id.
   * Uses `add` so the first tab to answer wins; later tabs get a constraint error.
   */
  save(requestId: string, state: unknown): Promise<void> {
    const snapshot = JSON.parse(JSON.stringify(state));
    return this.run(STORE_NAME, 'readwrite', (store: IDBObjectStore) => store.add(snapshot, requestId))
      .then(() => undefined);
  }

  load(requestId: string): Promise<unknown | undefined> {
    return this.run(STORE_NAME, 'readonly', (store: IDBObjectStore) => store.get(requestId));
  }

  remove(requestId: string): Promise<void> {
    return this.run(STORE_NAME, 'readwrite', (store: IDBObjectStore) => store.delete(requestId))
      .then(() => undefined);
  }

  private isAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && typeof indexedDB !== 'undefined';
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
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
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
