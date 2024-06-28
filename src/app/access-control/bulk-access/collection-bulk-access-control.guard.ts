import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { DsoPageSingleFeatureGuard } from '../../core/data/feature-authorization/feature-authorization-guard/dso-page-single-feature.guard';
import { Observable, of as observableOf } from 'rxjs';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { AuthService } from '../../core/auth/auth.service';
import { CollectionPageResolver } from '../../collection-page/collection-page.resolver';
import { Collection } from '../../core/shared/collection.model';

@Injectable({
  providedIn: 'root'
})
/**
 * Guard for preventing unauthorized access to certain {@link Collection} pages requiring BulkAccessControl
 */
export class CollectionBulkAccessControlGuard extends DsoPageSingleFeatureGuard<Collection> {
  constructor(protected resolver: CollectionPageResolver,
              protected authorizationService: AuthorizationDataService,
              protected router: Router,
              protected authService: AuthService) {
    super(resolver, authorizationService, router, authService);
  }

  /**
   * Check CanUseBulkAccessControl authorization rights
   */
  getFeatureID(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FeatureID> {
    return observableOf(FeatureID.CanUseBulkAccessControl);
  }
}
