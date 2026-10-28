import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Avatar } from '../../components/avatar/avatar';
import { AuthService } from '../../core/service/auth.service';
import { ProfileImageService } from '../../core/service/profile-image.service';
import { extractErrorMessage } from '../../core/service/http-error';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-edit-profile',
  imports: [Avatar, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-profile.html',
})
export class EditProfile {
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly images = inject(ProfileImageService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly user = this.auth.user;
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly error = signal('');
  protected readonly preview = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    firstname: [this.auth.user()?.firstname ?? '', Validators.required],
    lastname: [this.auth.user()?.lastname ?? '', Validators.required],
  });

  protected readonly fullName = computed(() => {
    const user = this.user();
    if (!user) {
      return '';
    }
    return `${user.firstname} ${user.lastname}`.trim() || user.email;
  });

  protected readonly displayUrl = computed(() => this.preview() ?? this.images.url());

  constructor() {
    effect(() => {
      const user = this.user();
      if (!user || this.form.dirty) {
        return;
      }
      this.form.patchValue({
        firstname: user.firstname,
        lastname: user.lastname,
      });
    });
  }

  protected onFile(file: File): void {
    this.error.set('');
    if (!file.type.startsWith('image/')) {
      this.error.set('Choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Image must be smaller than 5 MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    this.preview.set(url);
    this.uploading.set(true);
    this.users.uploadImage(file).subscribe({
      next: () => {
        this.uploading.set(false);
      },
      error: (error: unknown) => {
        this.uploading.set(false);
        URL.revokeObjectURL(url);
        this.preview.set(null);
        this.error.set(extractErrorMessage(error));
      },
    });
  }

  protected save(): void {
    this.error.set('');
    const firstname = this.form.controls.firstname.value.trim();
    const lastname = this.form.controls.lastname.value.trim();
    if (!firstname || !lastname) {
      this.form.markAllAsTouched();
      this.error.set('First name and last name are required.');
      return;
    }

    this.saving.set(true);
    this.users.updateProfile({ firstname, lastname }).subscribe({
      next: () => {
        void this.router.navigateByUrl('/profile');
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(extractErrorMessage(error));
      },
    });
  }
}
