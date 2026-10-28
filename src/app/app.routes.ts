import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/service/auth.guard';
import { EditProfile } from './pages/edit-profile/edit-profile';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { Register } from './pages/register/register';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'profile/edit', component: EditProfile, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
