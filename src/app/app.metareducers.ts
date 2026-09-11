import { ObjectCacheEntry } from './core/cache/object-cache.reducer';
import {
  isShareableRequestEntry,
  objectCacheTimestamp,
  requestCacheTimestamp,
  SharedCacheDelta,
} from './core/cross-tab-state/shared-cache.model';
import { RequestEntry } from './core/data/request-entry.model';
import { IndexName } from './core/index/index-name.model';
import { MetaIndexState } from './core/index/index.reducer';
import { hasValue } from './shared/empty.util';
import { StoreActionTypes } from './store.actions';

// fallback ngrx debugger
let actionCounter = 0;

export function debugMetaReducer(reducer) {
  return (state, action) => {
    actionCounter++;
    console.log('@ngrx action', actionCounter, action.type);
    console.log('state', JSON.stringify(state));
    console.log('action', JSON.stringify(action));
    console.log('------------------------------------');
    return reducer(state, action);
  };
}

export function universalMetaReducer(reducer) {
  return (state, action) => {
    switch (action.type) {
      case StoreActionTypes.REHYDRATE:
        state = Object.assign({}, state, action.payload, { ready: true });
        break;
      case StoreActionTypes.REHYDRATE_PARTIAL:
        state = mergeSharedCache(state, action.payload);
        break;
      case StoreActionTypes.CLEAR_CACHE:
        state = clearSharedCache(state);
        break;
      case StoreActionTypes.REPLAY:
      default:
        break;
    }
    return reducer(state, action);
  };
}

function mergeSharedCache(state: any, delta: SharedCacheDelta): any {
  if (!state?.core || !delta) {
    return state;
  }

  let objectsChanged = false;
  const objects = { ...(state.core['cache/object'] || {}) };
  Object.keys(delta.objects || {}).forEach((href: string) => {
    const incoming: ObjectCacheEntry = delta.objects[href];
    if (objectCacheTimestamp(incoming) > objectCacheTimestamp(objects[href])) {
      objects[href] = incoming;
      objectsChanged = true;
    }
  });
  (delta.deleteObjects || []).forEach((href: string) => {
    if (hasValue(objects[href])) {
      delete objects[href];
      objectsChanged = true;
    }
  });

  let requestsChanged = false;
  const requests = { ...(state.core['data/request'] || {}) };
  Object.keys(delta.requests || {}).forEach((uuid: string) => {
    const incoming: RequestEntry = delta.requests[uuid];
    if (requestCacheTimestamp(incoming) > requestCacheTimestamp(requests[uuid])) {
      requests[uuid] = incoming;
      requestsChanged = true;
    }
  });
  (delta.deleteRequests || []).forEach((uuid: string) => {
    if (hasValue(requests[uuid])) {
      delete requests[uuid];
      requestsChanged = true;
    }
  });

  let indexChanged = false;
  const index: MetaIndexState = { ...(state.core.index || {}) };
  Object.keys(delta.index || {}).forEach((indexName: string) => {
    const next = { ...(index[indexName] || {}) };
    let thisIndexChanged = false;
    Object.keys(delta.index[indexName] || {}).forEach((key: string) => {
      const incomingValue = delta.index[indexName][key];
      if (indexName === IndexName.REQUEST) {
        const existingUuid = next[key];
        const existingEntry = requests[existingUuid] || state.core['data/request']?.[existingUuid];
        if (hasValue(existingUuid) && isShareableRequestEntry(existingEntry)) {
          return;
        }
      }
      if (next[key] !== incomingValue) {
        next[key] = incomingValue;
        thisIndexChanged = true;
      }
    });
    if (thisIndexChanged) {
      index[indexName] = next;
      indexChanged = true;
    }
  });
  (delta.deleteIndex || []).forEach((removal) => {
    if (index[removal.indexName] && hasValue(index[removal.indexName][removal.key])) {
      const next = { ...index[removal.indexName] };
      delete next[removal.key];
      index[removal.indexName] = next;
      indexChanged = true;
    }
  });

  if (!objectsChanged && !requestsChanged && !indexChanged) {
    return state;
  }

  return {
    ...state,
    core: {
      ...state.core,
      ...(objectsChanged ? { 'cache/object': objects } : {}),
      ...(requestsChanged ? { 'data/request': requests } : {}),
      ...(indexChanged ? { index } : {}),
    },
  };
}

function clearSharedCache(state: any): any {
  if (!state?.core) {
    return state;
  }

  return {
    ...state,
    core: {
      ...state.core,
      'cache/object': {},
      'data/request': {},
      index: {},
    },
  };
}

export const debugMetaReducers = [
  debugMetaReducer,
];

export const appMetaReducers = [
  universalMetaReducer,
];
