import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth.service';
import { PushNotificationsService } from '@core/services/push-notifications.service';
import { ThemeService } from '@core/services/theme.service';
import { AuroraBackgroundComponent } from '@shared/components/aurora-background/aurora-background.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonSpinner,
    AuroraBackgroundComponent,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly push = inject(PushNotificationsService);
  private readonly theme = inject(ThemeService);

  readonly auroraColorStops = computed(() =>
    this.theme.isDark()
      ? ['#0058bd', '#2cbee8', '#4338ca']
      : ['#0058bd', '#2cbee8', '#3b82f6'],
  );
  readonly auroraAmplitude = computed(() => (this.theme.isDark() ? 0.65 : 0.56));
  readonly auroraBlend = computed(() => (this.theme.isDark() ? 0.45 : 0.38));
  readonly auroraSpeed = computed(() => 0.45);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth
      .login(email, password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          void this.push.enableForCurrentUser();
          void this.router.navigateByUrl(this.auth.defaultAppTabPath(), { replaceUrl: true });
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Identifiants incorrects');
        },
      });
  }
}
