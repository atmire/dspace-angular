/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';

import { type } from '../../shared/ngrx/type';

export const CrossTabStateActionTypes = {
  DISABLE: type('dspace/core/cross-tab/disable'),
  REQUEST: type('dspace/core/cross-tab/request'),
  RECEIVE: type('dspace/core/cross-tab/receive'),
  CANCEL: type('dspace/core/cross-tab/cancel'),
  TIMEOUT: type('dspace/core/cross-tab/timeout'),
};

export class CrossTabStateDisable implements Action {
  public type = CrossTabStateActionTypes.DISABLE;
}

export class CrossTabStateRequest implements Action {
  public type = CrossTabStateActionTypes.REQUEST;

  payload: {
    requestId: string
  };

  constructor(requestId: string) {
    this.payload = { requestId };
  }
}

export class CrossTabStateReceive implements Action {
  public type = CrossTabStateActionTypes.RECEIVE;

}

export class CrossTabStateCancel implements Action {
  public type = CrossTabStateActionTypes.CANCEL;

}

export class CrossTabStateTimeout implements Action {
  public type = CrossTabStateActionTypes.TIMEOUT;

}

export type CrossTabStateActions
  = CrossTabStateDisable
  | CrossTabStateRequest
  | CrossTabStateReceive
  | CrossTabStateCancel
  | CrossTabStateTimeout;
