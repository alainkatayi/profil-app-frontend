import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  readonly title = input('Log in');
  readonly subtitle = input("Hello, friend! Sign in to your profile. Let's get in touch!");
}
