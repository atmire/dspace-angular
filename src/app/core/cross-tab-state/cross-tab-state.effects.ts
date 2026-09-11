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
  filter,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { hasValue } from '../../shared/empty.util';
import {
  AddToObjectCacheAction,
  ObjectCacheActionTypes,
  RemoveFromObjectCacheAction,
} from '../cache/object-cache.actions';
import {
  RequestActionTypes,
  RequestErrorAction,
  RequestRemoveAction,
  RequestSuccessAction,
} from '../data/request.actions';
import { RequestEntry } from '../data/request-entry.model';
import { IndexName } from '../index/index-name.model';
import {
  AddToIndexAction,
  IndexActionTypes,
  RemoveFromIndexBySubstringAction,
  RemoveFromIndexByValueAction,
} from '../index/index.actions';
import { getUrlWithoutEmbedParams } from '../index/index.selectors';
import { BroadcastService } from './broadcast.service';
import { CrossTabCacheService } from './cross-tab-cache.service';
import { CrossTabStateStorageService } from './cross-tab-state-storage.service';
import {
  isCrossTabCacheClearMessage,
  isCrossTabCacheDeleteMessage,
  isCrossTabCachePutMessage,
} from './cross-tab-state.messages';
import {
  isObjectCacheExpired,
  isShareableRequestEntry,
  isSensitiveCacheHref,
  SharedCacheDelta,
} from './shared-cache.model';

@Injectable()
export class CrossTabStateEffects {

  constructor(
    protected actions$: Actions,
    protected store$: Store<any>,
    protected cacheService: CrossTabCacheService,
    protected storage: CrossTabStateStorageService,
    protected broadcastService: BroadcastService,
  ) {
  }

  /**
   * Persist object-cache mutations to IndexedDB and notify other tabs.
   */
  public persistObjectCache$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ObjectCacheActionTypes.ADD, ObjectCacheActionTypes.REMOVE),
      withLatestFrom(this.store$),
      tap(([action, state]: [AddToObjectCacheAction | RemoveFromObjectCacheAction, any]) => {
        if (action.type === ObjectCacheActionTypes.REMOVE) {
          const href = (action as RemoveFromObjectCacheAction).payload;
          if (!isSensitiveCacheHref(href)) {
            this.cacheService.enqueueDelta({ deleteObjects: [href] });
          }
          return;
        }

        const addAction = action as AddToObjectCacheAction;
        const href = hasValue(addAction.payload.objectToCache?._links?.self)
          ? addAction.payload.objectToCache._links.self.href
          : addAction.payload.alternativeLink;
        const entry = state?.core?.['cache/object']?.[href];
        if (!hasValue(href) || isSensitiveCacheHref(href) || isObjectCacheExpired(entry)) {
          return;
        }
        if (hasValue(entry)) {
          this.cacheService.enqueueDelta({ objects: { [href]: entry } });
        }
      }),
    );
  }, { dispatch: false });

  /**
   * Persist completed request-cache mutations. CONFIGURE/EXECUTE/STALE are skipped:
   * in-flight HTTP must stay local, and STALE from a local CONFIGURE would invalidate
   * the other tab's still-valid request for the same href.
   */
  public persistRequestCache$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        RequestActionTypes.SUCCESS,
        RequestActionTypes.ERROR,
        RequestActionTypes.REMOVE,
      ),
      withLatestFrom(this.store$),
      tap(([action, state]: [RequestSuccessAction | RequestErrorAction | RequestRemoveAction, any]) => {
        if (action.type === RequestActionTypes.REMOVE) {
          this.cacheService.enqueueDelta({
            deleteRequests: [(action as RequestRemoveAction).uuid],
          });
          return;
        }

        const uuid = (action as RequestSuccessAction | RequestErrorAction).payload.uuid;
        const entry: RequestEntry = state?.core?.['data/request']?.[uuid];
        if (!isShareableRequestEntry(entry)) {
          return;
        }

        const delta: SharedCacheDelta = {
          requests: { [uuid]: entry },
        };
        if (hasValue(entry.request?.href)) {
          delta.index = {
            [IndexName.REQUEST]: {
              [getUrlWithoutEmbedParams(entry.request.href)]: uuid,
            },
          };
        }
        this.cacheService.enqueueDelta(delta);
      }),
    );
  }, { dispatch: false });

  /**
   * Persist index ADD/REMOVE. Bulk removes resolve matching IndexedDB keys first.
   */
  public persistIndex$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        IndexActionTypes.ADD,
        IndexActionTypes.REMOVE_BY_VALUE,
        IndexActionTypes.REMOVE_BY_SUBSTRING,
      ),
      tap((action: AddToIndexAction | RemoveFromIndexByValueAction | RemoveFromIndexBySubstringAction) => {
        if (action.type === IndexActionTypes.ADD) {
          const addAction = action as AddToIndexAction;
          if (addAction.payload.name === IndexName.REQUEST) {
            return;
          }
          if (isSensitiveCacheHref(addAction.payload.key) || isSensitiveCacheHref(String(addAction.payload.value))) {
            return;
          }
          this.cacheService.enqueueDelta({
            index: {
              [addAction.payload.name]: {
                [addAction.payload.key]: addAction.payload.value,
              },
            },
          });
          return;
        }

        void this.persistIndexRemoval(action as RemoveFromIndexByValueAction | RemoveFromIndexBySubstringAction)
          .catch((error: unknown) => console.log('Failed to persist index removal', error));
      }),
    );
  }, { dispatch: false });

  /**
   * Apply cache deltas coming from other tabs into this tab's NgRx store.
   */
  public applyRemoteCache$ = createEffect(() => {
    return this.broadcastService.messages$.pipe(
      filter((message) => isCrossTabCachePutMessage(message) || isCrossTabCacheDeleteMessage(message)),
      tap((message: SharedCacheDelta) => {
        this.cacheService.applyRemoteDelta(message);
      }),
    );
  }, { dispatch: false });

  /**
   * Another tab wiped the shared cache (login/logout/impersonate/locale).
   */
  public applyRemoteClear$ = createEffect(() => {
    return this.broadcastService.messages$.pipe(
      filter(isCrossTabCacheClearMessage),
      tap(() => {
        console.log('Applied remote cache clear');
        this.cacheService.clearLocalSharedCache();
      }),
    );
  }, { dispatch: false });

  private async persistIndexRemoval(action: RemoveFromIndexByValueAction | RemoveFromIndexBySubstringAction): Promise<void> {
    const deleted = action.type === IndexActionTypes.REMOVE_BY_VALUE
      ? await this.storage.deleteIndexByValue(action.payload.name, action.payload.value)
      : await this.storage.deleteIndexBySubstring(action.payload.name, action.payload.value);

    if (deleted.length > 0) {
      this.cacheService.enqueueDelta({ deleteIndex: deleted });
    }
  }

}
