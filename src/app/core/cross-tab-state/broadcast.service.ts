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
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import {
  fromEvent,
  NEVER,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';

import { hasValue } from '../../shared/empty.util';
import { CROSS_TAB_BROADCAST_CHANNEL } from './cross-tab-state.messages';
import { cloneShareable } from './shared-cache.model';

/**
 * Thin wrapper around {@link BroadcastChannel} so tabs of the same origin can
 * signal each other. Does nothing during SSR.
 */
@Injectable({ providedIn: 'root' })
export class BroadcastService implements OnDestroy {
  private channel?: BroadcastChannel;

  /**
   * Inbound messages from other browsing contexts. Completes as NEVER on the server.
   */
  readonly messages$: Observable<unknown>;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    if (isPlatformBrowser(platformId) && typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CROSS_TAB_BROADCAST_CHANNEL);
      this.messages$ = fromEvent<MessageEvent>(this.channel, 'message').pipe(
        map((event: MessageEvent) => event.data),
      );
    } else {
      this.messages$ = NEVER;
    }
  }

  post(message: unknown): void {
    if (!hasValue(this.channel)) {
      return;
    }
    try {
      this.channel.postMessage(cloneShareable(message));
    } catch (error: unknown) {
      console.error('Failed to broadcast cache delta', error);
    }
  }

  ngOnDestroy(): void {
    this.channel?.close();
  }
}
