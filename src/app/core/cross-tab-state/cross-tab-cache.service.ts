/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';

import { AppState } from '../../app.reducer';
import { hasValue } from '../../shared/empty.util';
import {
  ClearSharedCacheAction,
  RehydratePartialAction,
} from '../../store.actions';
import { IndexName } from '../index/index-name.model';
import { BroadcastService } from './broadcast.service';
import { CrossTabStateStorageService } from './cross-tab-state-storage.service';
import { CrossTabStateMessageType } from './cross-tab-state.messages';
import {
  emptySharedCacheDelta,
  hasSharedCacheChanges,
  isObjectCacheExpired,
  isShareableRequestEntry,
  isSensitiveCacheHref,
  mergeSharedCacheDeltas,
  sanitizeSharedCacheDelta,
  SharedCacheDelta,
} from './shared-cache.model';

/**
 * Coordinates IndexedDB persistence, NgRx hydrate/clear, and Broadcast Channel.
 */
@Injectable({ providedIn: 'root' })
export class CrossTabCacheService {
  private queuedDelta: SharedCacheDelta = emptySharedCacheDelta();
  private flushTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    protected store: Store<AppState>,
    protected storage: CrossTabStateStorageService,
    protected broadcastService: BroadcastService,
  ) {
  }

  async hydrateIntoStore(): Promise<void> {
    try {
      const delta = sanitizeSharedCacheDelta(await this.storage.loadAll());
      if (!hasSharedCacheChanges(delta)) {
        return;
      }
      console.log('Hydrating from IndexedDB', delta);
      this.store.dispatch(new RehydratePartialAction(delta));
    } catch (error: unknown) {
      console.log('Failed to hydrate from IndexedDB', error);
    }
  }

  /**
   * Write the current NgRx REST cache to IndexedDB without notifying other tabs.
   * Used after SSR + IDB boot merge so the durable cache includes this page's SSR objects.
   */
  async persistStoreSnapshot(): Promise<void> {
    try {
      const state: any = await firstValueFrom(this.store);
      const core = state?.core;
      if (!hasValue(core)) {
        return;
      }

      const objects: SharedCacheDelta['objects'] = {};
      Object.keys(core['cache/object'] || {}).forEach((href: string) => {
        const entry = core['cache/object'][href];
        if (!isSensitiveCacheHref(href) && !isObjectCacheExpired(entry)) {
          objects[href] = entry;
        }
      });

      const requests: SharedCacheDelta['requests'] = {};
      Object.keys(core['data/request'] || {}).forEach((uuid: string) => {
        const entry = core['data/request'][uuid];
        if (isShareableRequestEntry(entry)) {
          requests[uuid] = entry;
        }
      });

      const index: SharedCacheDelta['index'] = {};
      Object.keys(core.index || {}).forEach((name: string) => {
        index[name] = {};
        Object.keys(core.index[name] || {}).forEach((key: string) => {
          const value = core.index[name][key];
          if (!isSensitiveCacheHref(key) && !isSensitiveCacheHref(String(value))) {
            if (name === IndexName.REQUEST && !hasValue(requests[value])) {
              return;
            }
            index[name][key] = value;
          }
        });
      });

      const delta: SharedCacheDelta = {
        objects,
        requests,
        index,
      };
      if (!hasSharedCacheChanges(delta)) {
        return;
      }
      await this.storage.applyDelta(delta);
    } catch (error: unknown) {
      console.log('Failed to persist store snapshot to IndexedDB', error);
    }
  }

  enqueueDelta(delta: SharedCacheDelta): void {
    const sanitized = sanitizeSharedCacheDelta(delta);
    if (!hasSharedCacheChanges(sanitized)) {
      return;
    }
    this.queuedDelta = mergeSharedCacheDeltas(this.queuedDelta, sanitized);
    if (hasValue(this.flushTimer)) {
      return;
    }
    this.flushTimer = setTimeout(() => {
      this.flushTimer = undefined;
      void this.flush();
    }, 0);
  }

  async flush(): Promise<void> {
    const delta = this.queuedDelta;
    this.queuedDelta = emptySharedCacheDelta();
    if (!hasSharedCacheChanges(delta)) {
      return;
    }

    try {
      const accepted = await this.storage.applyDelta(delta);
      if (!hasSharedCacheChanges(accepted)) {
        return;
      }
      console.log('Persisted cache delta', accepted);
      this.broadcastService.post({
        type: CrossTabStateMessageType.CACHE_PUT,
        ...accepted,
      });
    } catch (error: unknown) {
      console.error('Failed to persist cache delta', error);
    }
  }

  applyRemoteDelta(delta: SharedCacheDelta): void {
    const sanitized = sanitizeSharedCacheDelta(delta);
    if (!hasSharedCacheChanges(sanitized)) {
      return;
    }
    console.log('Applied remote cache delta', sanitized);
    this.store.dispatch(new RehydratePartialAction(sanitized));
  }

  async clearSharedCache(): Promise<void> {
    this.store.dispatch(new ClearSharedCacheAction());
    this.broadcastService.post({
      type: CrossTabStateMessageType.CACHE_CLEAR,
    });
    try {
      await this.storage.clear();
    } catch (error: unknown) {
      console.log('Failed to clear IndexedDB cache', error);
    }
  }

  clearLocalSharedCache(): void {
    this.store.dispatch(new ClearSharedCacheAction());
  }
}
