import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Avatar } from '../../components/avatar/avatar';
import { formatJoined } from '../../core/models/user.model';
import { AuthService } from '../../core/service/auth.service';
import { ProfileImageService } from '../../core/service/profile-image.service';

@Component({
  selector: 'app-profile',
  imports: [Avatar, RouterLink],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly images = inject(ProfileImageService);

  protected readonly user = this.auth.user;
  protected readonly imageUrl = this.images.url;

  protected readonly fullName = computed(() => {
    const user = this.user();
    if (!user) {
      return '';
    }
    return `${user.firstname} ${user.lastname}`.trim() || user.email;
  });

  protected readonly joined = computed(() => formatJoined(this.user()?.createdAt ?? ''));

  protected logout(): void {
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/login');
    });
  }
}
