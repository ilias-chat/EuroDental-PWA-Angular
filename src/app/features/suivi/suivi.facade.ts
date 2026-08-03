import { computed, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TaskListItem } from '@core/models/task.model';
import {
  SuiviTab,
  TrackingEvent,
  TrackingUser,
  TrackingWeekDay,
} from '@core/models/tracking.model';
import { TrackingApiService } from '@core/services/tracking-api.service';
import {
  formatDateKey,
  formatMonthYear,
  generateCalendarDays,
  monthRange,
  parseDateKey,
  tasksByDateMap,
  tasksForDate,
} from '@shared/utils/task-calendar';
import {
  mapTrackingUsers,
  shiftTrackingWeek,
  trackingWeekDays,
  userAvailableOnDate,
} from './utils/tracking-display';

@Injectable()
export class SuiviFacade {
  private readonly api = inject(TrackingApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly activeTab = signal<SuiviTab>('calendar');
  readonly selectedUserId = signal<number | null>(null);

  readonly usersLoading = signal(false);
  readonly usersError = signal<string | null>(null);
  readonly rawUsers = signal<TrackingUser[]>([]);
  readonly trackingUsers = computed(() =>
    mapTrackingUsers(this.rawUsers(), this.trackingDate())
  );

  readonly trackingDate = signal(formatDateKey(new Date()));
  readonly trackingEvents = signal<TrackingEvent[]>([]);
  readonly trackingLoading = signal(false);
  readonly trackingError = signal<string | null>(null);

  readonly trackingWeekDays = computed<TrackingWeekDay[]>(() => trackingWeekDays(this.trackingDate()));

  readonly calendarMonth = signal(new Date());
  readonly calendarLoading = signal(false);
  readonly calendarError = signal<string | null>(null);
  readonly calendarTasks = signal<TaskListItem[]>([]);
  private calendarLoadedRangeKey = '';

  readonly showDayTasksModal = signal(false);
  readonly dayModalDate = signal<string | null>(null);
  private pendingTaskNavigationId: number | null = null;

  readonly tasksByDate = computed(() => tasksByDateMap(this.calendarTasks()));
  readonly calendarDays = computed(() =>
    generateCalendarDays(this.calendarMonth(), this.tasksByDate())
  );
  readonly monthHeaderLabel = computed(() => formatMonthYear(this.calendarMonth()));

  readonly dayModalTasks = computed(() => {
    const date = this.dayModalDate();
    if (!date) return [];
    return tasksForDate(this.calendarTasks(), date);
  });

  readonly trackingLongDateLabel = computed(() => {
    return parseDateKey(this.trackingDate()).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  init(): void {
    this.loadUsers();
    this.loadCalendarTasks(true);
  }

  setTab(tab: SuiviTab): void {
    this.activeTab.set(tab);
    if (tab === 'tracking' && !this.rawUsers().length) {
      this.loadUsers();
    } else if (tab === 'tracking' && this.selectedUserId() != null) {
      this.loadTrackingEvents();
    }
    if (tab === 'calendar') {
      this.loadCalendarTasks(false);
    }
  }

  onSelectedUserChange(userId: number | null): void {
    this.selectedUserId.set(userId);
    this.loadCalendarTasks(true);
    if (userId == null) {
      this.trackingEvents.set([]);
      return;
    }
    if (this.activeTab() === 'tracking') {
      const user = this.trackingUsers().find((u) => u.id === userId);
      if (user?.available) {
        this.loadTrackingEvents();
      } else {
        this.trackingEvents.set([]);
      }
    }
  }

  loadUsers(): void {
    this.usersLoading.set(true);
    this.usersError.set(null);
    this.api
      .usersWithTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          this.rawUsers.set(Array.isArray(rows) ? rows : []);
          this.usersLoading.set(false);
          this.syncTrackingUserAfterUsersLoad();
        },
        error: (err) => {
          this.usersError.set(
            err?.status === 403
              ? 'Accès refusé au suivi.'
              : 'Impossible de charger les utilisateurs.'
          );
          this.rawUsers.set([]);
          this.usersLoading.set(false);
        },
      });
  }

  loadCalendarTasks(force: boolean): void {
    const month = this.calendarMonth();
    const range = monthRange(month.getFullYear(), month.getMonth());
    const userKey = this.selectedUserId() ?? 'all';
    const rangeKey = `${range.start}_${range.end}_${userKey}`;
    if (!force && rangeKey === this.calendarLoadedRangeKey) {
      return;
    }
    this.calendarLoadedRangeKey = rangeKey;
    this.calendarLoading.set(true);
    this.calendarError.set(null);
    this.api
      .tasksRange(range.start, range.end, this.selectedUserId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.calendarTasks.set(res.tasks ?? []);
          this.calendarLoading.set(false);
        },
        error: () => {
          this.calendarError.set('Impossible de charger le calendrier.');
          this.calendarTasks.set([]);
          this.calendarLoading.set(false);
        },
      });
  }

  previousMonth(): void {
    const d = new Date(this.calendarMonth());
    d.setMonth(d.getMonth() - 1);
    this.calendarMonth.set(d);
    this.loadCalendarTasks(true);
  }

  nextMonth(): void {
    const d = new Date(this.calendarMonth());
    d.setMonth(d.getMonth() + 1);
    this.calendarMonth.set(d);
    this.loadCalendarTasks(true);
  }

  openDayModal(dateKey: string): void {
    if (!parseDateKey(dateKey)) return;
    this.dayModalDate.set(dateKey);
    this.showDayTasksModal.set(true);
  }

  closeDayModal(): void {
    this.pendingTaskNavigationId = null;
    this.showDayTasksModal.set(false);
    this.dayModalDate.set(null);
  }

  onDayModalDismiss(): void {
    const taskId = this.pendingTaskNavigationId;
    this.pendingTaskNavigationId = null;
    this.dayModalDate.set(null);

    if (taskId != null) {
      void this.router.navigate(['/tasks', taskId], {
        state: { tasksListBackHref: '/suivi' },
      });
    }
  }

  openTask(task: TaskListItem): void {
    this.pendingTaskNavigationId = task.id;
    this.showDayTasksModal.set(false);
  }

  selectTrackingDate(date: string): void {
    this.trackingDate.set(date);
    const userId = this.selectedUserId();
    if (userId == null) {
      return;
    }
    const user = this.trackingUsers().find((u) => u.id === userId);
    if (!user?.available) {
      this.trackingEvents.set([]);
    } else {
      this.loadTrackingEvents();
    }
  }

  previousTrackingWeek(): void {
    this.selectTrackingDate(shiftTrackingWeek(this.trackingDate(), -1));
  }

  nextTrackingWeek(): void {
    this.selectTrackingDate(shiftTrackingWeek(this.trackingDate(), 1));
  }

  loadTrackingEvents(): void {
    const uid = this.selectedUserId();
    if (uid == null) {
      this.trackingEvents.set([]);
      return;
    }
    this.trackingLoading.set(true);
    this.trackingError.set(null);
    this.api
      .trackingEvents(uid, this.trackingDate())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.trackingEvents.set(res.tracking ?? []);
          this.trackingLoading.set(false);
        },
        error: () => {
          this.trackingError.set('Impossible de charger le suivi.');
          this.trackingEvents.set([]);
          this.trackingLoading.set(false);
        },
      });
  }

  monthTaskCount(): number {
    const { start, end } = monthRange(
      this.calendarMonth().getFullYear(),
      this.calendarMonth().getMonth()
    );
    return this.calendarTasks().filter((t) => t.task_date >= start && t.task_date <= end).length;
  }

  tasksForDayCell(dateKey: string): TaskListItem[] {
    return this.tasksByDate().get(dateKey) ?? [];
  }

  dayModalTitle(): string {
    const date = this.dayModalDate();
    if (!date) return '';
    return parseDateKey(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private syncTrackingUserAfterUsersLoad(): void {
    const userId = this.selectedUserId();
    if (userId != null && this.activeTab() === 'tracking') {
      const user = this.trackingUsers().find((u) => u.id === userId);
      if (user?.available) {
        this.loadTrackingEvents();
      }
    }
  }
}
