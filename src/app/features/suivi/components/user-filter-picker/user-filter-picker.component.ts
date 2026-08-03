import { Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrackingUserView } from '@core/models/tracking.model';
import { avatarFallbackUrl, resolveAvatarUrl } from '@shared/utils/asset-url';

@Component({
  selector: 'app-user-filter-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-filter-picker.component.html',
  styleUrl: './user-filter-picker.component.scss',
})
export class UserFilterPickerComponent {
  readonly users = input.required<TrackingUserView[]>();
  readonly selectedUserId = model<number | null>(null);
  readonly loading = input(false);

  readonly dropdownOpen = signal(false);
  readonly searchQuery = signal('');

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.users();
    if (!q) return list;
    return list.filter((u) => u.name.toLowerCase().includes(q));
  });

  readonly displayLabel = computed(() => {
    const id = this.selectedUserId();
    if (id == null) return 'Tous les utilisateurs';
    return this.users().find((u) => u.id === id)?.name ?? 'Utilisateur';
  });

  readonly selectedUser = computed(() => {
    const id = this.selectedUserId();
    if (id == null) return null;
    return this.users().find((u) => u.id === id) ?? null;
  });

  private readonly avatarFallbackByUserId = signal<Record<number, string>>({});

  toggleDropdown(): void {
    this.dropdownOpen.update((v) => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
    this.searchQuery.set('');
  }

  pickAll(): void {
    this.selectedUserId.set(null);
    this.closeDropdown();
  }

  pickUser(user: TrackingUserView): void {
    this.selectedUserId.set(user.id);
    this.closeDropdown();
  }

  userAvatar(user: TrackingUserView | null): string {
    if (!user) return avatarFallbackUrl('Utilisateur');
    return this.avatarFallbackByUserId()[user.id] ?? resolveAvatarUrl(user.name, user.image);
  }

  onAvatarError(user: TrackingUserView): void {
    this.avatarFallbackByUserId.update((m) => ({
      ...m,
      [user.id]: avatarFallbackUrl(user.name),
    }));
  }
}
