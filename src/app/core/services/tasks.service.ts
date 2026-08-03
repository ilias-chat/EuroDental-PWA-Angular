import { Injectable, inject } from '@angular/core';
import { CatalogService } from './catalog.service';
import { TaskActionsService } from './task-actions.service';
import { TaskApiService } from './task-api.service';
import { TaskBillingService } from './task-billing.service';

/** @deprecated Prefer TaskApiService, TaskActionsService, TaskBillingService, CatalogService */
@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly api = inject(TaskApiService);
  private readonly actions = inject(TaskActionsService);
  private readonly billing = inject(TaskBillingService);
  private readonly catalog = inject(CatalogService);

  getTodayTasks = () => this.api.getTodayTasks();
  getTasksInRange = (start: string, end: string) => this.api.getTasksInRange(start, end);
  getPastTasks = () => this.api.getPastTasks();
  getTask = (id: number) => this.api.getTask(id);
  getTaskEvents = (taskId: number) => this.api.getTaskEvents(taskId);
  getUserLastEvent = (taskId: number) => this.api.getUserLastEvent(taskId);
  updateDescription = (taskId: number, description: string) =>
    this.api.updateDescription(taskId, description);
  postAction = (taskId: number, action: string, body?: Record<string, unknown>) =>
    this.actions.postAction(taskId, action, body);
  recordPayment = (taskId: number, amountPaid: number) =>
    this.billing.recordPayment(taskId, amountPaid);
  recordAdminDelivery = (taskId: number, amount: number, deliveryDate: string) =>
    this.billing.recordAdminDelivery(taskId, amount, deliveryDate);
  getUsers = () => this.billing.getUsers();
  getAllServices = () => this.catalog.getAllServices();
  updateTaskServices = (taskId: number, serviceIds: number[]) =>
    this.catalog.updateTaskServices(taskId, serviceIds);
  proposeService = (taskId: number, name: string) =>
    this.catalog.proposeService(taskId, name);
}

export type { CatalogServiceItem } from '@core/models/catalog.model';
