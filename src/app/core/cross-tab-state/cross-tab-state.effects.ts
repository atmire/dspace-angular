/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  EMPTY,
  from,
  of,
} from 'rxjs';
import {
  catchError,
  delay,
  filter,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { AppState } from '../../app.reducer';
import { hasNoValue } from '../../shared/empty.util';
import { NoOpAction } from '../../shared/ngrx/no-op.action';
import {
  StoreAction,
  StoreActionTypes,
} from '../../store.actions';
import { BroadcastService } from './broadcast.service';
import { CrossTabStateStorageService } from './cross-tab-state-storage.service';
import {
  CrossTabStateActionTypes,
  CrossTabStateCancel,
  CrossTabStateReceive,
  CrossTabStateRequest,
  CrossTabStateTimeout,
} from './cross-tab-state.actions';
import {
  CROSS_TAB_STATE_TIMEOUT_MS,
  CrossTabStateMessageType,
  isCrossTabStateReadyMessage,
  isCrossTabStateRequestMessage,
} from './cross-tab-state.messages';
import { CrossTabStateStatus } from './cross-tab-state.reducer';

@Injectable()
export class CrossTabStateEffects {

  constructor(
    protected actions$: Actions,
    protected store$: Store<any>,
    protected broadcastService: BroadcastService,
    protected storage: CrossTabStateStorageService,
  ) {
  }

  /**
   * Ask other tabs for a cache snapshot, then time out if none of them answer.
   */
  public sendStateRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CrossTabStateActionTypes.REQUEST),
      tap((action: CrossTabStateRequest) => {
        console.log('Request cross-tab state', action.payload.requestId);
        this.broadcastService.post({
          type: CrossTabStateMessageType.STATE_REQUEST,
          requestId: action.payload.requestId,
        });
      }),
      delay(CROSS_TAB_STATE_TIMEOUT_MS),
      withLatestFrom(this.store$),
      switchMap(([action, store]: [CrossTabStateRequest, any]) => {
        if (store.core.crosstab.status === CrossTabStateStatus.PENDING) {
          console.log('Timed out waiting for cross-tab state');
          return from(this.storage.remove(action.payload.requestId)).pipe(
            map(() => new CrossTabStateTimeout()),
            catchError(() => of(new CrossTabStateTimeout())),
          );
        }
        return of(new NoOpAction());
      }),
      catchError(() => of(new CrossTabStateCancel())),
    );
  });

  /**
   * An already-running tab writes its shareable cache to IndexedDB and signals that it is ready.
   * Tabs that are themselves still waiting for a snapshot do not answer.
   */
  public handleStateRequest$ = createEffect(() => {
    return this.broadcastService.messages$.pipe(
      filter(isCrossTabStateRequestMessage),
      withLatestFrom(this.store$),
      filter(([, store]) => store.core.crosstab.status !== CrossTabStateStatus.PENDING),
      switchMap(([message, store]) => {
        console.log('Got cross-tab state request', message.requestId);
        return from(this.storage.save(message.requestId, this.shareableState(store))).pipe(
          tap(() => this.broadcastService.post({
            type: CrossTabStateMessageType.STATE_READY,
            requestId: message.requestId,
          })),
          catchError((error: unknown) => {
            console.log('Skipping cross-tab state response', error);
            return EMPTY;
          }),
        );
      }),
    );
  }, { dispatch: false });

  /**
   * The requesting tab reads the first matching snapshot and rehydrates from it.
   */
  public handleStateResponse$ = createEffect(() => {
    return this.broadcastService.messages$.pipe(
      filter(isCrossTabStateReadyMessage),
      withLatestFrom(this.store$),
      filter(([message, state]) => state.core.crosstab.status === CrossTabStateStatus.PENDING
        && message.requestId === state.core.crosstab.requestId),
      switchMap(([message]) => {
        return from(this.storage.load(message.requestId)).pipe(
          switchMap((shareableState: unknown) => {
            if (hasNoValue(shareableState)) {
              return EMPTY;
            }

            console.log('Got cross-tab state response', message.requestId);
            return from(this.storage.remove(message.requestId)).pipe(
              switchMap(() => this.rehydrateFrom(shareableState)),
              catchError(() => this.rehydrateFrom(shareableState)),
            );
          }),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  private rehydrateFrom(shareableState: unknown) {
    return of(
      new StoreAction(StoreActionTypes.REHYDRATE, shareableState as AppState),
      new CrossTabStateReceive(),
    );
  }

  private shareableState(state: any): any {
    return {
      core: {
        'cache/object': {
          ...state.core['cache/object'],
          // todo: limit this to "safe" data somehow? don't imagine this matters since we already have a shared authorization cookie 🤷‍
        },
        'data/request': {
          ...state.core['data/request'],
          // todo: determine what to retain based on the previous thing
        },
        'index': {
          ...state.core.index,
          // todo: determine what to retain based on the previous things
        },
      },
    };
  }
}
