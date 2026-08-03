import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { ViewWillLeave } from '@ionic/angular';
import {
  IonContent,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AuthService } from '@core/auth/auth.service';
import { TaskListItem } from '@core/models/task.model';
import { SuiviTab } from '@core/models/tracking.model';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { TaskStatusBadgeComponent } from '@shared/components/task-status-badge/task-status-badge.component';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { statusDotColor } from '@shared/utils/task-calendar';
import { avatarFallbackUrl } from '@shared/utils/asset-url';
import { UserFilterPickerComponent } from './components/user-filter-picker/user-filter-picker.component';
import { SuiviFacade } from './suivi.facade';
import {
  trackingEventDescription,
  trackingEventIcon,
  trackingEventLabel,
  trackingPillClass,
  trackingTimelineDotClass,
} from './utils/tracking-display';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

@Component({
  selector: 'app-suivi',
  standalone: true,
  providers: [SuiviFacade],
  imports: [
    NgClass,
    AppHeaderComponent,
    IonContent,
    IonModal,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    UserFilterPickerComponent,
    TaskStatusBadgeComponent,
    UserAvatarComponent,
  ],
  templateUrl: './suivi.page.html',
  styleUrl: './suivi.page.scss',
})
export class SuiviPage implements OnInit, ViewWillLeave {
  readonly auth = inject(AuthService);
  readonly f = inject(SuiviFacade);

  readonly weekdayLabels = WEEKDAY_LABELS;

  readonly trackingEventLabel = trackingEventLabel;
  readonly trackingEventDescription = trackingEventDescription;
  readonly trackingTimelineDotClass = trackingTimelineDotClass;
  readonly trackingPillClass = trackingPillClass;
  readonly trackingEventIcon = trackingEventIcon;
  readonly statusDotColor = statusDotColor;

  ngOnInit(): void {
    this.f.init();
  }

  ionViewWillLeave(): void {
    this.f.closeDayModal();
  }

  setTab(tab: SuiviTab): void {
    this.f.setTab(tab);
  }

  onUserFilterChange(userId: number | null): void {
    this.f.onSelectedUserChange(userId);
  }

  refresh(event: CustomEvent): void {
    this.f.loadUsers();
    this.f.loadCalendarTasks(true);
    if (this.f.selectedUserId() != null) {
      this.f.loadTrackingEvents();
    }
    event.target && (event.target as HTMLIonRefresherElement).complete();
  }

  taskTypeLabel(type: string): string {
    return type || 'Tâche';
  }

  teamMembers(task: TaskListItem) {
    const members = [];
    if (task.technician) members.push(task.technician);
    if (task.helping_users?.length) members.push(...task.helping_users);
    return members;
  }

  visibleTeam(task: TaskListItem) {
    return this.teamMembers(task).slice(0, 3);
  }

  extraTeamCount(task: TaskListItem): number {
    return Math.max(0, this.teamMembers(task).length - 3);
  }

  eventClientImage(ev: { client_name: string | null; client_image: string | null }): string {
    if (ev.client_image) return ev.client_image;
    return avatarFallbackUrl(ev.client_name ?? 'Client');
  }
}
