import { hasValue } from '@dspace/utils';
import { of } from 'rxjs';

export class HALEndpointServiceStub {

  constructor(private url: string) {}
  getEndpoint(path: string, startHref?: string) {
    if (hasValue(startHref)) {
      return of(startHref + '/' + path);
    }
    return of(this.url + '/' + path);
  }
}
