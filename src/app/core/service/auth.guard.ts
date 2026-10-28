import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const users = inject(UserService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  return users.getMe().pipe(
    map(() => true),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        auth.clearLocal();
        return of(router.createUrlTree(['/login']));
      }
      return of(true);
    }),
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return router.createUrlTree(['/profile']);
  }
  return true;
};
