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
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  filter,
  fromEvent,
  NEVER,
  Observable,
  of,
} from 'rxjs';
import {
  catchError,
  delay,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { AppState } from '../../app.reducer';
import { hasValue } from '../../shared/empty.util';
import { NoOpAction } from '../../shared/ngrx/no-op.action';
import {
  StoreAction,
  StoreActionTypes,
} from '../../store.actions';
import {
  CrossTabStateActionTypes,
  CrossTabStateCancel,
  CrossTabStateReceive,
  CrossTabStateRequest,
  CrossTabStateTimeout,
} from './cross-tab-state.actions';
import { CrossTabStateStatus } from './cross-tab-state.reducer';

function ifWindowAvailable<T>(somethingSomethingWindow: T): T | undefined {
  if (typeof window !== 'undefined') {
    return somethingSomethingWindow;
  } else {
    return undefined;
  }
}

@Injectable()
export class CrossTabStateEffects {
  REQUEST_KEY_PREFIX = '__DSpace_cross_tab_state_request_';  // todo: need to specify host as well
  RESPONSE_KEY_PREFIX = '__DSpace_cross_tab_state_response_';

  constructor(
    protected actions$: Actions,
    protected store$: Store<any>,
    @Inject(PLATFORM_ID) private platformID: any,
  ) {
  }

  public sendStateRequest$ = createEffect(() => {
    return this.actions$.pipe(
      // todo: could make more sense to keep track of a shared entry that each tab updates once in a while
      ofType(CrossTabStateActionTypes.REQUEST),
      map((action: CrossTabStateRequest) => {
        console.log('Request cross-tab state'); // todo: remove this
        const key = this.getRequestKey(action.payload.requestId);
        this.localStorage.setItem(key, 'pls');
      }),
      delay(50),
      withLatestFrom(this.store$),
      map(([_, store]) => {
        if (store.core.crosstab.status === CrossTabStateStatus.PENDING) {
          console.log('Timed out!'); // todo: remove this
          const key = this.getRequestKey(store.core.crosstab.requestId);
          this.localStorage.removeItem(key);
          return new CrossTabStateTimeout();
        } else {
          return new NoOpAction();
        }
      }),
      catchError(() => of(new CrossTabStateCancel())),
    );
  });

  public handleStateRequest$ = createEffect(() => {
    return this.localStorageEvents$.pipe(  // todo: this won't fly in the server!
      withLatestFrom(this.store$),
      filter(([event, _]) => hasValue(event)),  // don't care about removed items
      filter(([event, _]) => event.key.startsWith(this.REQUEST_KEY_PREFIX)),
      // filter(([event, store]) => store.core.crosstab.status !== CrossTabStateStatus.PENDING
      //   && !event.key.endsWith(store.core.crosstab.status.requestId)),
      tap(([event, store]) => {
        console.log('Got cross-tab state request:', event.newValue); // todo: remove this
        const requestId = this.getRequestId(event.key);
        const newKey = this.getResponseKey(requestId);
        this.localStorage.setItem(newKey, JSON.stringify(this.shareableState(store)));
      }),
      delay(1000),
      map(([event, _]) => {
        console.log('Cleaning up after handled state request: ', event.newValue); // todo: remove this
        const requestId = this.getRequestId(event.key);
        const newKey = this.getResponseKey(requestId);
        this.localStorage.removeItem(newKey);
      }),
    );
  }, { dispatch: false });

  public handleStateResponse$ = createEffect(() => {
    return this.localStorageEvents$.pipe(
      withLatestFrom(this.store$),
      filter(([event, _]) => hasValue(event)),  // don't care about removed items
      filter(([event, state]) => state.core.crosstab.status === CrossTabStateStatus.PENDING
        && event.key === this.getResponseKey(state.core.crosstab.requestId),
      ),
      switchMap(([event, store]) => {
        console.log('Got cross-tab state response:', event.newValue);

        this.localStorage.removeItem(this.getRequestKey(store.core.crosstab.requestId));

        return of(
          new StoreAction(StoreActionTypes.REHYDRATE, JSON.parse(event.newValue) as unknown as AppState),
          new CrossTabStateReceive(),
        );
      }),
    );
  });

  private get localStorageEvents$(): Observable<StorageEvent> {
    if (isPlatformBrowser(this.platformID)) {
      return fromEvent<StorageEvent>(window, 'storage');
    } else {
      return NEVER;
    }
  }

  private get localStorage(): Storage {
    if (isPlatformBrowser(this.platformID)) {
      return window.localStorage;
    } else {
      throw new Error('No localStore API on the server, why are we trying to use it?');
    }
  }

  private getRequestId(key: string) {
    if (key.startsWith(this.REQUEST_KEY_PREFIX)) {
      return key.split(this.REQUEST_KEY_PREFIX)[1];
    } else {
      return undefined;
    }
  }

  private getRequestKey(requestId: string) {
    return this.REQUEST_KEY_PREFIX + requestId;
  }

  private getResponseKey(requestId: string) {
    return this.RESPONSE_KEY_PREFIX + requestId;
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
