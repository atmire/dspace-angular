import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { find } from 'rxjs/operators';

import { getDataServiceFor } from '../../../core/cache/builders/build-decorators';
import { ResourceType } from '../../../core/shared/resource-type';
import { DataService } from '../../../core/data/data.service';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { hasValue, isEmpty } from '../../empty.util';
import { RemoteData } from '../../../core/data/remote-data';

/**
 * This class represents a resolver that requests a specific item before the route is activated
 */
@Injectable()
export class ResourcePolicyTargetResolver implements Resolve<RemoteData<DSpaceObject>> {

  /**
   * The data service used to make request.
   */
  private dataService: DataService<DSpaceObject>;

  constructor(private parentInjector: Injector, private router: Router) {
  }

  /**
   * Method for resolving an item based on the parameters in the current route
   * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
   * @param {RouterStateSnapshot} state The current RouterStateSnapshot
   * @returns Observable<<RemoteData<Item>> Emits the found item based on the parameters in the current route,
   * or an error if something went wrong
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RemoteData<DSpaceObject>> {
    const targetType = route.queryParamMap.get('targetType');
    const policyTargetId = route.queryParamMap.get('policyTargetId');

    if (isEmpty(targetType) || isEmpty(policyTargetId)) {
      this.router.navigateByUrl('/404', { skipLocationChange: true });
    }

    const provider = getDataServiceFor(new ResourceType(targetType));
    this.dataService = Injector.create({
      providers: [],
      parent: this.parentInjector
    }).get(provider);

    return this.dataService.findById(policyTargetId).pipe(
      find((RD) => hasValue(RD.error) || RD.hasSucceeded),
    );
  }
}
