import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import {
  AuthService,
  HardRedirectService,
  PAGE_NOT_FOUND_PATH,
} from '@dspace/core';
import { map } from 'rxjs/operators';

export const notAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const redirectService = inject(HardRedirectService);

  return authService.isAuthenticated().pipe(
    map((isLoggedIn) => {
      if (isLoggedIn) {
        redirectService.redirect(PAGE_NOT_FOUND_PATH);
        return false;
      }

      return true;
    }),
  );
};
