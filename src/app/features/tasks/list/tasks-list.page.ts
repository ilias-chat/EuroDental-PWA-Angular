import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AuthService } from '@core/auth/auth.service';
import { TaskApiService } from '@core/services/task-api.service';
import { TaskListItem, TaskUserRef } from '@core/models/task.model';
import { TaskStatusBadgeComponent } from '@shared/components/task-status-badge/task-status-badge.component';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { CreateTaskModalComponent } from '@features/tasks/shared/create-task-modal/create-task-modal.component';
import {
  CalendarDayCell,
  formatDateKey,
  formatDisplayDate,
  formatMonthYear,
  generateCalendarDays,
  getDateLabel,
  parseDateKey,
  rangeAroundMonth,
  statusDotColor,
  taskCountForMonth,
  tasksByDateMap,
  tasksForDate,
  TasksViewMode,
} from '../../../shared/utils/task-calendar';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    IonContent,
    IonModal,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    TaskStatusBadgeComponent,
    UserAvatarComponent,
    CreateTaskModalComponent,
  ],
  templateUrl: './tasks-list.page.html',
  styleUrl: './tasks-list.page.scss',
})
export class TasksListPage implements OnInit, ViewWillEnter {
  readonly auth = inject(AuthService);
  private readonly taskApi = inject(TaskApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly weekdayLabels = WEEKDAY_LABELS;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly allTasks = signal<TaskListItem[]>([]);
  readonly viewMode = signal<TasksViewMode>('day');
  readonly selectedDate = signal(new Date());

  readonly pastTasksCount = signal(0);
  readonly pastTasks = signal<TaskListItem[]>([]);
  readonly showPastTasksModal = signal(false);
  readonly loadingPastTasks = signal(false);
  readonly showCreateTaskModal = signal(false);
  readonly canCreateTasks = signal(this.auth.canCreateTasks());

  private loadedRangeKeys = new Set<string>();
  private pendingPastTaskNavigation: number | null = null;

  readonly tasksByDate = computed(() => tasksByDateMap(this.allTasks()));

  readonly filteredTasks = computed(() =>
    tasksForDate(this.allTasks(), formatDateKey(this.selectedDate()))
  );

  readonly calendarDays = computed(() =>
    generateCalendarDays(this.selectedDate(), this.tasksByDate())
  );

  readonly monthTaskCount = computed(() => {
    const d = this.selectedDate();
    return taskCountForMonth(this.allTasks(), d.getFullYear(), d.getMonth());
  });

  readonly dayHeaderDate = computed(() => {
    const d = this.selectedDate();
    return formatDisplayDate(d) + getDateLabel(d);
  });

  readonly monthHeaderLabel = computed(() => formatMonthYear(this.selectedDate()));

  ngOnInit(): void {
    this.applyDateFromUrl();
    this.persistDateInUrl();
    this.route.queryParamMap.subscribe((params) => {
      const dateKey = params.get('date');
      if (!dateKey || !this.isValidDateKey(dateKey)) {
        return;
      }
      if (dateKey === formatDateKey(this.selectedDate())) {
        return;
      }
      this.selectedDate.set(parseDateKey(dateKey));
      this.fetchRangeForDate(this.selectedDate(), false);
    });
    this.load();
  }

  ionViewWillEnter(): void {
    this.loadPastTasksCount();
    if (this.applyDateFromUrl()) {
      this.fetchRangeForDate(this.selectedDate(), false);
    }
  }

  load(event?: { target: HTMLIonRefresherElement }): void {
    if (!event) {
      this.loading.set(true);
      this.error.set(null);
    }
    this.loadedRangeKeys.clear();
    this.fetchRangeForDate(this.selectedDate(), true, event);
    this.loadPastTasksCount();
  }

  toggleView(): void {
    const next: TasksViewMode = this.viewMode() === 'day' ? 'month' : 'day';
    this.viewMode.set(next);
    if (next === 'month') {
      this.fetchRangeForDate(this.selectedDate(), false);
    }
  }

  selectDay(dateKey: string): void {
    this.selectedDate.set(parseDateKey(dateKey));
    this.viewMode.set('day');
    this.persistDateInUrl();
  }

  previousMonth(): void {
    const d = this.selectedDate();
    this.selectedDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.fetchRangeForDate(this.selectedDate(), false);
    this.persistDateInUrl();
  }

  nextMonth(): void {
    const d = this.selectedDate();
    this.selectedDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.fetchRangeForDate(this.selectedDate(), false);
    this.persistDateInUrl();
  }

  tasksForDayCell(day: CalendarDayCell): TaskListItem[] {
    return this.tasksByDate().get(day.date) ?? [];
  }

  openTask(task: TaskListItem): void {
    void this.router.navigate(['/tasks', task.id], {
      state: { tasksListDate: formatDateKey(this.selectedDate()) },
    });
  }

  openCreateTaskModal(): void {
    this.showCreateTaskModal.set(true);
  }

  onTaskCreated(): void {
    this.showCreateTaskModal.set(false);
    this.loadedRangeKeys.clear();
    this.fetchRangeForDate(this.selectedDate(), true);
  }

  openPastTasksModal(): void {
    this.showPastTasksModal.set(true);
    this.loadingPastTasks.set(true);
    this.taskApi.getPastTasks().subscribe({
      next: (res) => {
        this.loadingPastTasks.set(false);
        if (res.success) {
          this.pastTasks.set(res.past_tasks ?? []);
          this.pastTasksCount.set(res.count ?? res.past_tasks?.length ?? 0);
        } else {
          this.pastTasks.set([]);
        }
      },
      error: () => {
        this.loadingPastTasks.set(false);
        this.pastTasks.set([]);
      },
    });
  }

  closePastTasksModal(): void {
    this.pendingPastTaskNavigation = null;
    this.showPastTasksModal.set(false);
  }

  onPastTasksModalDismiss(): void {
    const taskId = this.pendingPastTaskNavigation;
    this.pendingPastTaskNavigation = null;
    this.pastTasks.set([]);
    this.loadingPastTasks.set(false);

    if (taskId != null) {
      void this.router.navigate(['/tasks', taskId], {
        state: { tasksListDate: formatDateKey(this.selectedDate()) },
      });
    }
  }

  openPastTask(task: TaskListItem): void {
    this.pendingPastTaskNavigation = task.id;
    this.showPastTasksModal.set(false);
  }

  taskCountLabel(count: number): string {
    return `${count} tâche${count > 1 ? 's' : ''}`;
  }

  taskTypeLabel(type: string): string {
    return (type || 'Tâche').toUpperCase();
  }

  teamMembers(task: TaskListItem): TaskUserRef[] {
    const members: TaskUserRef[] = [];
    if (task.technician) {
      members.push(task.technician);
    }
    members.push(...task.helping_users);
    return members;
  }

  visibleTeam(task: TaskListItem) {
    return this.teamMembers(task).slice(0, 2);
  }

  extraTeamCount(task: TaskListItem): number {
    return Math.max(0, this.teamMembers(task).length - 2);
  }

  visibleHelpers(task: TaskListItem): TaskUserRef[] {
    return (task.helping_users ?? []).slice(0, 2);
  }

  extraHelpersCount(task: TaskListItem): number {
    const count = task.helping_users?.length ?? 0;
    return Math.max(0, count - 2);
  }

  isTeamMemberHighlighted(task: TaskListItem, memberId: number): boolean {
    if (task.technician?.id === memberId) {
      return task.is_main_technician;
    }
    return task.is_helping_user && task.helping_users.some((h) => h.id === memberId);
  }

  formatTimeRange(task: TaskListItem): string | null {
    if (!task.started_at) {
      return null;
    }
    const start = this.formatTime(task.started_at);
    if (task.finished_at) {
      return `${start} - ${this.formatTime(task.finished_at)}`;
    }
    return start;
  }

  private formatTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  statusDotColor(status: string): string {
    return statusDotColor(status);
  }

  formatDateKey = formatDateKey;

  private fetchRangeForDate(
    date: Date,
    showLoading: boolean,
    refreshEvent?: { target: HTMLIonRefresherElement }
  ): void {
    const { start, end } = rangeAroundMonth(date, 1);
    const rangeKey = `${start}_${end}`;
    if (this.loadedRangeKeys.has(rangeKey) && !refreshEvent) {
      if (showLoading) this.loading.set(false);
      return;
    }

    if (showLoading && !refreshEvent) {
      this.loading.set(true);
      this.error.set(null);
    }

    this.taskApi.getTasksInRange(start, end).subscribe({
      next: (res) => {
        this.mergeTasks(res.tasks ?? []);
        this.loadedRangeKeys.add(rangeKey);
        this.loading.set(false);
        this.error.set(null);
        refreshEvent?.target.complete();
      },
      error: () => {
        if (showLoading) {
          this.allTasks.set([]);
        }
        this.loading.set(false);
        this.error.set('Impossible de charger les tâches. Tirez vers le bas pour réessayer.');
        refreshEvent?.target.complete();
      },
    });
  }

  private loadPastTasksCount(): void {
    this.taskApi.getPastTasks().subscribe({
      next: (res) => {
        if (res.success) {
          this.pastTasksCount.set(res.count ?? res.past_tasks?.length ?? 0);
        } else {
          this.pastTasksCount.set(0);
        }
      },
      error: () => this.pastTasksCount.set(0),
    });
  }

  private applyDateFromUrl(): boolean {
    const dateKey = this.route.snapshot.queryParamMap.get('date');
    if (!dateKey || !this.isValidDateKey(dateKey)) {
      return false;
    }
    const parsed = parseDateKey(dateKey);
    if (formatDateKey(parsed) === formatDateKey(this.selectedDate())) {
      return false;
    }
    this.selectedDate.set(parsed);
    return true;
  }

  private persistDateInUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: formatDateKey(this.selectedDate()) },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private isValidDateKey(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const parsed = parseDateKey(value);
    return formatDateKey(parsed) === value;
  }

  private mergeTasks(incoming: TaskListItem[]): void {
    const byId = new Map(this.allTasks().map((t) => [t.id, t]));
    for (const task of incoming) {
      byId.set(task.id, task);
    }
    this.allTasks.set(
      [...byId.values()].sort((a, b) => {
        const da = a.task_date?.slice(0, 10) ?? '';
        const db = b.task_date?.slice(0, 10) ?? '';
        if (da !== db) return da.localeCompare(db);
        return b.id - a.id;
      })
    );
  }
}
