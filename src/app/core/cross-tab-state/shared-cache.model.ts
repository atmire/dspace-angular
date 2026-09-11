/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import { hasValue } from '../../shared/empty.util';
import { ObjectCacheEntry } from '../cache/object-cache.reducer';
import { RequestEntry } from '../data/request-entry.model';
import {
  isLoading,
  isStale,
} from '../data/request-entry-state.model';
import { IndexName } from '../index/index-name.model';

/**
 * Incremental REST-cache mutation shared via IndexedDB and Broadcast Channel.
 * Auth and UI slices are never included.
 */
export interface SharedCacheDelta {
  objects?: { [href: string]: ObjectCacheEntry };
  requests?: { [uuid: string]: RequestEntry };
  index?: { [indexName: string]: { [key: string]: any } };
  deleteObjects?: string[];
  deleteRequests?: string[];
  deleteIndex?: { indexName: string; key: string }[];
}

export const AUTHORIZATIONS_HREF_MARKER = '/authorizations';

export function isSensitiveCacheHref(href: string | undefined): boolean {
  return typeof href === 'string' && href.includes(AUTHORIZATIONS_HREF_MARKER);
}

export function emptySharedCacheDelta(): SharedCacheDelta {
  return {};
}

export function hasSharedCacheChanges(delta: SharedCacheDelta): boolean {
  return Object.keys(delta.objects || {}).length > 0
    || Object.keys(delta.requests || {}).length > 0
    || Object.keys(delta.index || {}).some((name: string) => Object.keys(delta.index[name] || {}).length > 0)
    || (delta.deleteObjects || []).length > 0
    || (delta.deleteRequests || []).length > 0
    || (delta.deleteIndex || []).length > 0;
}

export function mergeSharedCacheDeltas(target: SharedCacheDelta, incoming: SharedCacheDelta): SharedCacheDelta {
  const merged: SharedCacheDelta = {
    objects: { ...target.objects, ...incoming.objects },
    requests: { ...target.requests, ...incoming.requests },
    index: { ...target.index },
    deleteObjects: [...(target.deleteObjects || []), ...(incoming.deleteObjects || [])],
    deleteRequests: [...(target.deleteRequests || []), ...(incoming.deleteRequests || [])],
    deleteIndex: [...(target.deleteIndex || []), ...(incoming.deleteIndex || [])],
  };

  Object.keys(incoming.index || {}).forEach((name: string) => {
    merged.index[name] = {
      ...(merged.index[name] || {}),
      ...incoming.index[name],
    };
  });

  return merged;
}

export function objectCacheTimestamp(entry: ObjectCacheEntry | undefined): number {
  return entry?.timeCompleted || 0;
}

export function requestCacheTimestamp(entry: RequestEntry | undefined): number {
  return entry?.lastUpdated || entry?.response?.timeCompleted || 0;
}

export function indexRecordKey(indexName: string | IndexName, key: string): string {
  return `${indexName}::${key}`;
}

/**
 * Structured clone (BroadcastChannel) cannot copy request class methods such as
 * getResponseParser. JSON clone matches what IndexedDB already stores.
 */
export function cloneShareable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function isObjectCacheExpired(entry: ObjectCacheEntry | undefined, now: number = Date.now()): boolean {
  if (!hasValue(entry) || !hasValue(entry.timeCompleted) || !hasValue(entry.msToLive)) {
    return false;
  }
  return now > entry.timeCompleted + entry.msToLive;
}

export function isRequestCacheExpired(entry: RequestEntry | undefined, now: number = Date.now()): boolean {
  if (!hasValue(entry?.response?.timeCompleted) || !hasValue(entry?.request?.responseMsToLive)) {
    return false;
  }
  return now > entry.response.timeCompleted + entry.request.responseMsToLive;
}

/**
 * Completed, still-valid request entries are the only ones worth sharing.
 * Pending and stale entries stay local: broadcasting STALE makes the other tab
 * refetch, which CONFIGUREs a new uuid, which stales this tab's uuid, forever.
 */
export function isShareableRequestEntry(entry: RequestEntry | undefined): boolean {
  return hasValue(entry)
    && !isLoading(entry.state)
    && !isStale(entry.state)
    && !isSensitiveCacheHref(entry.request?.href)
    && !isRequestCacheExpired(entry);
}

/**
 * Drop request entries that must not be stored or sent to other tabs.
 */
export function sanitizeSharedCacheDelta(delta: SharedCacheDelta): SharedCacheDelta {
  const requests: SharedCacheDelta['requests'] = {};
  Object.keys(delta.requests || {}).forEach((uuid: string) => {
    const entry = delta.requests[uuid];
    if (isShareableRequestEntry(entry)) {
      requests[uuid] = entry;
    }
  });

  const index: SharedCacheDelta['index'] = {};
  Object.keys(delta.index || {}).forEach((name: string) => {
    index[name] = {};
    Object.keys(delta.index[name] || {}).forEach((key: string) => {
      const value = delta.index[name][key];
      if (isSensitiveCacheHref(key) || isSensitiveCacheHref(String(value))) {
        return;
      }
      if (name === IndexName.REQUEST && !hasValue(requests[String(value)])) {
        return;
      }
      index[name][key] = value;
    });
  });

  return {
    ...delta,
    requests,
    index,
  };
}
