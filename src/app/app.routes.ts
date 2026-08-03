import { Routes } from '@angular/router';
import {
  authGuard,
  guestGuard,
  proposeTaskGuard,
  stockGuard,
  suiviGuard,
  tasksGuard,
  ticketsGuard,
} from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
    canActivate: [guestGuard],
  },
  {
    path: 'tabs',
    loadComponent: () => import('./layout/tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [authGuard],
    children: [
      {
        path: 'deplacement',
        loadComponent: () =>
          import('./features/deplacement/deplacement.page').then((m) => m.DeplacementPage),
      },
      {
        path: 'welcome',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/list/tasks-list.page').then((m) => m.TasksListPage),
        canActivate: [tasksGuard],
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./features/stock/list/stock-list.page').then((m) => m.StockListPage),
        canActivate: [stockGuard],
      },
      {
        path: 'propose',
        loadComponent: () =>
          import('./features/propose-task/list/propose-task.page').then((m) => m.ProposeTaskPage),
        canActivate: [proposeTaskGuard],
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/tickets/list/tickets-list.page').then((m) => m.TicketsListPage),
        canActivate: [ticketsGuard],
      },
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'deplacement/:id',
    loadComponent: () =>
      import('./features/deplacement/detail/deplacement-detail.page').then(
        (m) => m.DeplacementDetailPage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./features/tasks/detail/task-detail.page').then((m) => m.TaskDetailPage),
    canActivate: [authGuard],
  },
  {
    path: 'tickets/:id',
    loadComponent: () =>
      import('./features/tickets/detail/ticket-detail.page').then((m) => m.TicketDetailPage),
    canActivate: [authGuard, ticketsGuard],
  },
  {
    path: 'leave-requests',
    loadComponent: () =>
      import('./features/leave-requests/list/leave-requests.page').then(
        (m) => m.LeaveRequestsPage
      ),
    canActivate: [authGuard, tasksGuard],
  },
  {
    path: 'suivi',
    loadComponent: () => import('./features/suivi/suivi.page').then((m) => m.SuiviPage),
    canActivate: [authGuard, suiviGuard],
  },
  {
    path: '',
    redirectTo: 'tabs/tasks',
    pathMatch: 'full',
  },
];
