import {
  Injectable,
  Injector,
} from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import {
  catchError,
  filter,
  map,
  mergeMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';

import {
  hasValue,
  isNotEmpty,
} from '../../shared/empty.util';
import { getClassForType } from '../cache/builders/build-decorators';
import { ParsedResponse } from '../cache/response.models';
import { DSpaceSerializer } from '../dspace-rest/dspace.serializer';
import { DspaceRestService } from '../dspace-rest/dspace-rest.service';
import { RawRestResponse } from '../dspace-rest/raw-rest-response.model';
import { XSRFService } from '../xsrf/xsrf.service';
import {
  RequestActionTypes,
  RequestErrorAction,
  RequestExecuteAction,
  RequestSuccessAction,
} from './request.actions';
import { RequestService } from './request.service';
import { RequestEntry } from './request-entry.model';
import { RequestError } from './request-error.model';
import { RestRequestMethod } from './rest-request-method';
import { RestRequestWithResponseParser } from './rest-request-with-response-parser.model';

@Injectable()
export class RequestEffects {

  execute = createEffect(() => this.actions$.pipe(
    ofType(RequestActionTypes.EXECUTE),
    mergeMap((action: RequestExecuteAction) => {
      return this.requestService.getByUUID(action.payload).pipe(
        take(1),
      );
    }),
    filter((entry: RequestEntry) => hasValue(entry)),
    withLatestFrom(this.xsrfService.tokenInitialized$),
    // If it's a GET request, or we have an XSRF token, dispatch it immediately
    // Otherwise wait for the XSRF token first
    filter(([entry, tokenInitialized]: [RequestEntry, boolean]) => entry.request.method === RestRequestMethod.GET || tokenInitialized === true),
    map(([entry, tokenInitialized]: [RequestEntry, boolean]) => entry.request),
    mergeMap((request: RestRequestWithResponseParser) => {
      let body = request.body;
      if (isNotEmpty(request.body) && !request.isMultipart) {
        const serializer = new DSpaceSerializer(getClassForType(request.body.type));
        body = serializer.serialize(request.body);
      }
      return this.restApi.request(request.method, request.href, body, request.options, request.isMultipart).pipe(
        map((data: RawRestResponse) => this.injector.get(request.getResponseParser()).parse(request, data)),
        map((response: ParsedResponse) => new RequestSuccessAction(request.uuid, response.statusCode, response.link, response.unCacheableObject)),
        catchError((error: unknown) => {
          if (error instanceof RequestError) {
            // if it's an error returned by the server, complete the request
            return [new RequestErrorAction(request.uuid, error.statusCode, error.message)];
          } else {
            // if it's a client side error, throw it
            throw error;
          }
        }),
      );
    }),
  ));

  constructor(
    private actions$: Actions,
    private restApi: DspaceRestService,
    private injector: Injector,
    protected requestService: RequestService,
    protected xsrfService: XSRFService,
  ) { }

}
