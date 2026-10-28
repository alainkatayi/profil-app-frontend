import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../core/service/auth.service';
import { extractErrorMessage } from '../../core/service/http-error';

@Component({
  selector: 'app-register',
  imports: [AuthLayout, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected invalid(name: 'firstname' | 'lastname' | 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected submit(): void {
    this.error.set('');
    const value = this.form.getRawValue();
    const firstname = value.firstname.trim();
    const lastname = value.lastname.trim();
    if (!firstname) {
      this.form.controls.firstname.setErrors({ required: true });
    }
    if (!lastname) {
      this.form.controls.lastname.setErrors({ required: true });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.auth
      .register({
        email: value.email.trim(),
        password: value.password,
        firstname,
        lastname,
      })
      .subscribe({
        next: () => {
          this.auth.rememberEmail(value.email.trim());
          void this.router.navigateByUrl('/profile');
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.error.set(extractErrorMessage(error));
        },
      });
  }
}
