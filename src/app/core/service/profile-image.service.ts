import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ProfileImageService {
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private shown: string | null = null;

  readonly url = signal<string | null>(null);

  constructor() {
    toObservable(this.auth.user)
      .pipe(
        map((user) => user?.profileImage ?? null),
        distinctUntilChanged(),
        switchMap((fileName) => {
          if (!fileName) {
            return of(null);
          }
          return this.users.loadProfileImage(fileName).pipe(
            map((blob) => URL.createObjectURL(blob)),
            catchError(() => of(null)),
          );
        }),
      )
      .subscribe((objectUrl) => {
        if (this.shown && this.shown !== objectUrl) {
          URL.revokeObjectURL(this.shown);
        }
        this.shown = objectUrl;
        this.url.set(objectUrl);
      });
  }
}
