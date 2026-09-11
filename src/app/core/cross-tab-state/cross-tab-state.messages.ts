/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { hasValue } from '../../shared/empty.util';
import { SharedCacheDelta } from './shared-cache.model';

export const CROSS_TAB_BROADCAST_CHANNEL = 'dspace-cross-tab-state';

export const CrossTabStateMessageType = {
  CACHE_PUT: 'CACHE_PUT',
  CACHE_DELETE: 'CACHE_DELETE',
  CACHE_CLEAR: 'CACHE_CLEAR',
} as const;

export interface CrossTabCachePutMessage extends SharedCacheDelta {
  type: typeof CrossTabStateMessageType.CACHE_PUT;
}

export interface CrossTabCacheDeleteMessage extends SharedCacheDelta {
  type: typeof CrossTabStateMessageType.CACHE_DELETE;
}

export interface CrossTabCacheClearMessage {
  type: typeof CrossTabStateMessageType.CACHE_CLEAR;
}

export type CrossTabStateMessage
  = CrossTabCachePutMessage
  | CrossTabCacheDeleteMessage
  | CrossTabCacheClearMessage;

export function isCrossTabCachePutMessage(message: unknown): message is CrossTabCachePutMessage {
  return hasValue(message)
    && typeof message === 'object'
    && (message as CrossTabStateMessage).type === CrossTabStateMessageType.CACHE_PUT;
}

export function isCrossTabCacheDeleteMessage(message: unknown): message is CrossTabCacheDeleteMessage {
  return hasValue(message)
    && typeof message === 'object'
    && (message as CrossTabStateMessage).type === CrossTabStateMessageType.CACHE_DELETE;
}

export function isCrossTabCacheClearMessage(message: unknown): message is CrossTabCacheClearMessage {
  return hasValue(message)
    && typeof message === 'object'
    && (message as CrossTabStateMessage).type === CrossTabStateMessageType.CACHE_CLEAR;
}
