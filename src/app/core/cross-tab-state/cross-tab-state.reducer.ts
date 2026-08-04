/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import {
  CrossTabStateActions,
  CrossTabStateActionTypes,
} from './cross-tab-state.actions';

export enum CrossTabStateStatus {
  TBD,
  DISABLED,
  PENDING,
  SYNCED,
  CANCELED,
  TIMED_OUT,
}

export interface CrossTabState {
  status: CrossTabStateStatus,
  requestId?: string,
}

/**
 * The initial state.
 */
const initialState: CrossTabState = {
  status: CrossTabStateStatus.TBD,
  requestId: undefined,
};

export function crossTabStateReducer(state: CrossTabState = initialState, action: CrossTabStateActions) {
  switch (action.type) {
    case CrossTabStateActionTypes.DISABLE: {
      return Object.assign({}, state, {
        status: CrossTabStateStatus.DISABLED,
      });
    }
    case CrossTabStateActionTypes.REQUEST: {
      return Object.assign({}, state, {
        status: CrossTabStateStatus.PENDING,
        requestId: action.payload.requestId,
      });
    }
    case CrossTabStateActionTypes.RECEIVE: {
      return Object.assign({}, state, {
        status: CrossTabStateStatus.SYNCED,
      });
    }
    case CrossTabStateActionTypes.CANCEL: {
      return Object.assign({}, state, {
        status: CrossTabStateStatus.CANCELED,
      });
    }
    case CrossTabStateActionTypes.TIMEOUT: {
      return Object.assign({}, state, {
        status: CrossTabStateStatus.TIMED_OUT,
      });
    }
    default: {
      return state;
    }
  }
}
