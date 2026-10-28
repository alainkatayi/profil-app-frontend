import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../core/service/auth.service';
import { extractErrorMessage } from '../../core/service/http-error';

@Component({
  selector: 'app-login',
  imports: [AuthLayout, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    email: [this.auth.rememberedEmail(), [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected invalid(name: 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.auth.login({ email: email.trim(), password }).subscribe({
      next: () => {
        this.auth.rememberEmail(email.trim());
        void this.router.navigateByUrl('/profile');
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(error));
      },
    });
  }
}
