import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { DetailTab } from './task-detail.types';
import { TaskDetailFacade } from './task-detail.facade';
import { TaskDetailModalsComponent } from './modals/task-detail-modals.component';
import { TaskInfoTabComponent } from './tabs/task-info-tab.component';
import { TaskProgressionTabComponent } from './tabs/task-progression-tab.component';
import { TaskWarrantyTabComponent } from './tabs/task-warranty-tab.component';
import { TaskServicesTabComponent } from './tabs/task-services-tab.component';
import { TaskPaymentsTabComponent } from './tabs/task-payments-tab.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  providers: [TaskDetailFacade],
  imports: [
    AppHeaderComponent,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
    TaskInfoTabComponent,
    TaskProgressionTabComponent,
    TaskWarrantyTabComponent,
    TaskServicesTabComponent,
    TaskPaymentsTabComponent,
    TaskDetailModalsComponent,
  ],
  templateUrl: './task-detail.page.html',
  styleUrl: './task-detail.page.scss',
})
export class TaskDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly f = inject(TaskDetailFacade);

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.f.init(taskId, this.resolveTasksListBackHref());
  }

  setTab(value: DetailTab): void {
    this.f.setTab(value);
  }

  private resolveTasksListBackHref(): string {
    const state = this.router.lastSuccessfulNavigation?.extras?.state as
      | {
          tasksListBackHref?: string;
          tasksListDate?: string;
          deplacementId?: number;
          deplacementTab?: string;
        }
      | undefined;
    const historyState = history.state as {
      tasksListBackHref?: string;
      tasksListDate?: string;
      deplacementId?: number;
      deplacementTab?: string;
    };

    const explicitBack = state?.tasksListBackHref ?? historyState?.tasksListBackHref;
    if (explicitBack?.startsWith('/')) {
      return explicitBack;
    }

    const deplacementId = state?.deplacementId ?? historyState?.deplacementId;
    const deplacementTab = state?.deplacementTab ?? historyState?.deplacementTab ?? 'tasks';
    if (deplacementId) {
      const tab = deplacementTab || 'tasks';
      return `/deplacement/${deplacementId}?tab=${tab}`;
    }
    const dateKey = state?.tasksListDate ?? historyState?.tasksListDate;
    if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return `/tabs/tasks?date=${dateKey}`;
    }
    return '/tabs/tasks';
  }
}
