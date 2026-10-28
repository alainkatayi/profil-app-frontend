import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from './token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = inject(TokenService);
  const token = tokens.getToken();
  if (!token || req.headers.has('Authorization')) {
    return next(req);
  }
  const type = tokens.getType() || 'Bearer';
  return next(
    req.clone({
      setHeaders: {
        Authorization: `${type} ${token}`,
      },
    }),
  );
};
