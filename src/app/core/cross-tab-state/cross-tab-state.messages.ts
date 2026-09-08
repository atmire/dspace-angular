/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { hasValue } from '../../shared/empty.util';

/**
 * How long a new tab waits for another tab to share its NgRx cache.
 * The requesting tab can still continue earlier if a response arrives before this.
 */
export const CROSS_TAB_STATE_TIMEOUT_MS = 2000;

export const CROSS_TAB_BROADCAST_CHANNEL = 'dspace-cross-tab-state';

export const CrossTabStateMessageType = {
  STATE_REQUEST: 'STATE_REQUEST',
  STATE_READY: 'STATE_READY',
} as const;

export interface CrossTabStateRequestMessage {
  type: typeof CrossTabStateMessageType.STATE_REQUEST;
  requestId: string;
}

export interface CrossTabStateReadyMessage {
  type: typeof CrossTabStateMessageType.STATE_READY;
  requestId: string;
}

export type CrossTabStateMessage = CrossTabStateRequestMessage | CrossTabStateReadyMessage;

export function isCrossTabStateRequestMessage(message: unknown): message is CrossTabStateRequestMessage {
  return hasValue(message)
    && typeof message === 'object'
    && (message as CrossTabStateMessage).type === CrossTabStateMessageType.STATE_REQUEST
    && hasValue((message as CrossTabStateRequestMessage).requestId);
}

export function isCrossTabStateReadyMessage(message: unknown): message is CrossTabStateReadyMessage {
  return hasValue(message)
    && typeof message === 'object'
    && (message as CrossTabStateMessage).type === CrossTabStateMessageType.STATE_READY
    && hasValue((message as CrossTabStateReadyMessage).requestId);
}
