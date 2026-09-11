/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';

import { AppState } from './app.reducer';
import { SharedCacheDelta } from './core/cross-tab-state/shared-cache.model';
import { type } from './shared/ngrx/type';

export const StoreActionTypes = {
  REHYDRATE: type('dspace/ngrx/REHYDRATE'),
  REHYDRATE_PARTIAL: type('dspace/ngrx/REHYDRATE_PARTIAL'),
  CLEAR_CACHE: type('dspace/ngrx/CLEAR_CACHE'),
  REPLAY: type('dspace/ngrx/REPLAY'),
};

export class StoreAction implements Action {
  type: string;
  payload: AppState | Action[];
  // eslint-disable-next-line @typescript-eslint/no-shadow
  constructor(type: string, payload: AppState | Action[]) {
    this.type = type;
    this.payload = payload;
  }
}

/**
 * Merge REST cache slices from IndexedDB or another tab without resetting timestamps.
 */
export class RehydratePartialAction implements Action {
  type = StoreActionTypes.REHYDRATE_PARTIAL;

  constructor(public payload: SharedCacheDelta) {
  }
}

/**
 * Wipe the shared REST cache slices (login/logout/impersonate/locale).
 */
export class ClearSharedCacheAction implements Action {
  type = StoreActionTypes.CLEAR_CACHE;
}
