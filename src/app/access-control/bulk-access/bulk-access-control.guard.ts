import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { Observable, of as observableOf } from 'rxjs';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { AuthService } from '../../core/auth/auth.service';
import { SingleFeatureAuthorizationGuard } from '../../core/data/feature-authorization/feature-authorization-guard/single-feature-authorization.guard';

@Injectable({
  providedIn: 'root'
})
/**
 * Guard for preventing unauthorized access when requiring BulkAccessControl
 */
export class BulkAccessControlGuard extends SingleFeatureAuthorizationGuard {
  constructor(protected authorizationService: AuthorizationDataService,
              protected router: Router,
              protected authService: AuthService) {
    super(authorizationService, router, authService);
  }

  /**
   * Check CanUseBulkAccessControl authorization rights
   */
  getFeatureID(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FeatureID> {
    return observableOf(FeatureID.CanUseBulkAccessControl);
  }
}
