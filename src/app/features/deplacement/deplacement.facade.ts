import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DeploymentApiService } from '@core/services/deployment-api.service';
import {
  DeploymentListItem,
  DeploymentMonthBadge,
  DeplacementViewMode,
} from '@core/models/deployment.model';
import {
  dayHeaderLabel,
  deploymentCountLabel,
  formatDateKey,
  formatMonthParam,
  formatMonthYear,
  generateDeploymentCalendarDays,
  monthDeploymentCount,
  parseDateKey,
  parseViewFromQuery,
} from './utils/deployment-display';

@Injectable()
export class DeplacementFacade {
  private readonly api = inject(DeploymentApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly monthLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly viewMode = signal<DeplacementViewMode>('day');
  readonly selectedDate = signal(new Date());
  readonly dayDeployments = signal<DeploymentListItem[]>([]);
  readonly monthDeployments = signal<Record<string, DeploymentMonthBadge[]>>({});

  readonly pastDeploymentsCount = signal(0);
  readonly pastDeployments = signal<DeploymentListItem[]>([]);
  readonly showPastDeploymentsModal = signal(false);
  readonly loadingPastDeployments = signal(false);

  private pendingPastDeploymentId: number | null = null;

  readonly calendarDays = computed(() =>
    generateDeploymentCalendarDays(this.selectedDate(), this.monthDeployments())
  );

  readonly dayHeaderDate = computed(() => dayHeaderLabel(this.selectedDate()));
  readonly monthHeaderLabel = computed(() => formatMonthYear(this.selectedDate()));
  readonly monthDeploymentTotal = computed(() => {
    const d = this.selectedDate();
    return monthDeploymentCount(this.monthDeployments(), d.getFullYear(), d.getMonth());
  });

  init(): void {
    this.applyFromUrl();
    this.persistUrl();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const dateKey = params.get('date');
      if (dateKey && this.isValidDateKey(dateKey) && dateKey !== formatDateKey(this.selectedDate())) {
        this.selectedDate.set(parseDateKey(dateKey));
        this.load();
        return;
      }
      const view = parseViewFromQuery(params.get('view'));
      if (view !== this.viewMode()) {
        this.viewMode.set(view);
        this.load();
      }
    });
    this.load();
  }

  onViewEnter(): void {
    this.loadPastDeploymentsCount();
    if (this.applyDateFromUrl()) {
      this.load();
    }
  }

  applyDateFromUrl(): boolean {
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

  load(event?: CustomEvent): void {
    this.loadPastDeploymentsCount();
    if (this.viewMode() === 'month') {
      this.loadMonth(event);
    } else {
      this.loadDay(event);
    }
  }

  loadDay(event?: CustomEvent): void {
    if (!event) {
      this.loading.set(true);
      this.error.set(null);
    }
    const date = formatDateKey(this.selectedDate());
    this.api
      .day(date)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dayDeployments.set(res.deployments ?? []);
          this.loading.set(false);
          this.completeRefresher(event);
        },
        error: () => {
          this.error.set('Impossible de charger vos déplacements.');
          this.dayDeployments.set([]);
          this.loading.set(false);
          this.completeRefresher(event);
        },
      });
  }

  loadMonth(event?: CustomEvent): void {
    this.monthLoading.set(true);
    if (!event) {
      this.loading.set(true);
      this.error.set(null);
    }
    const month = formatMonthParam(this.selectedDate());
    this.api
      .month(month)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.monthDeployments.set(res.deployments ?? {});
          this.monthLoading.set(false);
          this.loading.set(false);
          this.completeRefresher(event);
        },
        error: () => {
          this.error.set('Impossible de charger le calendrier des déplacements.');
          this.monthDeployments.set({});
          this.monthLoading.set(false);
          this.loading.set(false);
          this.completeRefresher(event);
        },
      });
  }

  toggleView(): void {
    const next: DeplacementViewMode = this.viewMode() === 'day' ? 'month' : 'day';
    this.viewMode.set(next);
    this.persistUrl();
    if (next === 'month') {
      this.loadMonth();
    } else {
      this.loadDay();
    }
  }

  previousMonth(): void {
    const d = this.selectedDate();
    this.selectedDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.persistUrl();
    this.loadMonth();
  }

  nextMonth(): void {
    const d = this.selectedDate();
    this.selectedDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.persistUrl();
    this.loadMonth();
  }

  selectDay(dateKey: string): void {
    this.selectedDate.set(parseDateKey(dateKey));
    this.viewMode.set('day');
    this.persistUrl();
    this.loadDay();
  }

  openDeployment(item: DeploymentListItem): void {
    void this.router.navigate(['/deplacement', item.id], {
      state: {
        deplacementDate: formatDateKey(this.selectedDate()),
        deplacementView: this.viewMode(),
      },
    });
  }

  openPastDeploymentsModal(): void {
    this.showPastDeploymentsModal.set(true);
    this.loadingPastDeployments.set(true);
    this.api
      .pastList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loadingPastDeployments.set(false);
          if (res.success) {
            this.pastDeployments.set(res.past_deployments ?? []);
            this.pastDeploymentsCount.set(res.count ?? res.past_deployments?.length ?? 0);
          } else {
            this.pastDeployments.set([]);
          }
        },
        error: () => {
          this.loadingPastDeployments.set(false);
          this.pastDeployments.set([]);
        },
      });
  }

  closePastDeploymentsModal(): void {
    this.pendingPastDeploymentId = null;
    this.showPastDeploymentsModal.set(false);
  }

  onPastDeploymentsModalDismiss(): void {
    const deploymentId = this.pendingPastDeploymentId;
    this.pendingPastDeploymentId = null;
    this.pastDeployments.set([]);
    this.loadingPastDeployments.set(false);

    if (deploymentId != null) {
      void this.router.navigate(['/deplacement', deploymentId], {
        state: {
          deplacementDate: formatDateKey(this.selectedDate()),
          deplacementView: this.viewMode(),
        },
      });
    }
  }

  openPastDeployment(item: DeploymentListItem): void {
    this.pendingPastDeploymentId = item.id;
    this.showPastDeploymentsModal.set(false);
  }

  loadPastDeploymentsCount(): void {
    this.api
      .pastCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.pastDeploymentsCount.set(res.count ?? 0);
          } else {
            this.pastDeploymentsCount.set(0);
          }
        },
        error: () => this.pastDeploymentsCount.set(0),
      });
  }

  deploymentCountLabel(count: number): string {
    return deploymentCountLabel(count);
  }

  private applyFromUrl(): void {
    const params = this.route.snapshot.queryParamMap;
    const dateKey = params.get('date');
    if (dateKey && this.isValidDateKey(dateKey)) {
      this.selectedDate.set(parseDateKey(dateKey));
    }
    this.viewMode.set(parseViewFromQuery(params.get('view')));
  }

  private persistUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        date: formatDateKey(this.selectedDate()),
        view: this.viewMode() === 'month' ? 'month' : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private isValidDateKey(key: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      return false;
    }
    const parsed = parseDateKey(key);
    return formatDateKey(parsed) === key;
  }

  private completeRefresher(event?: CustomEvent): void {
    const target = event?.target as HTMLIonRefresherElement | undefined;
    target?.complete();
  }
}
