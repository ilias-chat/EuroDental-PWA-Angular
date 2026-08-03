import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonContent,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { DeplacementDetailTab } from './deplacement-detail.types';
import { DeplacementDetailFacade } from './deplacement-detail.facade';
import { DeplacementDetailModalsComponent } from './modals/deplacement-detail-modals.component';
import { DeploymentInfoTabComponent } from './tabs/deployment-info-tab.component';
import { DeploymentTimelineTabComponent } from './tabs/deployment-timeline-tab.component';
import { DeploymentExpensesTabComponent } from './tabs/deployment-expenses-tab.component';
import { DeploymentTasksTabComponent } from './tabs/deployment-tasks-tab.component';

@Component({
  selector: 'app-deplacement-detail',
  standalone: true,
  providers: [DeplacementDetailFacade],
  imports: [
    AppHeaderComponent,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
    DeploymentInfoTabComponent,
    DeploymentTimelineTabComponent,
    DeploymentExpensesTabComponent,
    DeploymentTasksTabComponent,
    DeplacementDetailModalsComponent,
  ],
  templateUrl: './deplacement-detail.page.html',
  styleUrl: './deplacement-detail.page.scss',
})
export class DeplacementDetailPage implements OnInit, ViewWillEnter {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly f = inject(DeplacementDetailFacade);
  private viewEntered = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.f.init(id, this.resolveDeplacementListBackHref());
  }

  ionViewWillEnter(): void {
    if (this.viewEntered) {
      this.f.load();
    }
    this.viewEntered = true;
  }

  setTab(value: DeplacementDetailTab): void {
    this.f.setTab(value);
  }

  private resolveDeplacementListBackHref(): string {
    const state = this.router.lastSuccessfulNavigation?.extras?.state as
      | { deplacementDate?: string; deplacementView?: string }
      | undefined;
    const historyState = history.state as {
      deplacementDate?: string;
      deplacementView?: string;
    };
    const dateKey = state?.deplacementDate ?? historyState?.deplacementDate;
    const view = state?.deplacementView ?? historyState?.deplacementView;
    const params = new URLSearchParams();
    if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      params.set('date', dateKey);
    }
    if (view === 'month') {
      params.set('view', 'month');
    }
    const qs = params.toString();
    return qs ? `/tabs/deplacement?${qs}` : '/tabs/deplacement';
  }
}
