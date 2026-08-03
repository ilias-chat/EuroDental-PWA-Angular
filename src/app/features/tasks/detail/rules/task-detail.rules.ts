import { TaskDetail, TaskEvent, TaskUserRef } from '@core/models/task.model';
import { DetailTab } from '../task-detail.types';

export function isAdminDeliveryAutoTask(t: TaskDetail): boolean {
  return !!t.task_name && t.task_name.indexOf("Remise paiement à l'administration") === 0;
}

export function isRestrictedDetailTab(tab: DetailTab): boolean {
  return tab === 'warranty' || tab === 'services' || tab === 'payments';
}

export function canManageServices(t: TaskDetail): boolean {
  return t.is_main_technician && t.status !== 'terminée' && t.status !== 'annulée';
}

export function canEditDescription(t: TaskDetail): boolean {
  return t.is_main_technician;
}

export function canShowClientPaymentSection(t: TaskDetail): boolean {
  return t.is_main_technician && !t.is_paid;
}

export function canAddAdminDeliveryPayment(t: TaskDetail): boolean {
  return (
    t.is_main_technician &&
    t.status !== 'terminée' &&
    t.status !== 'annulée' &&
    (t.admin_delivery_amount == null || t.admin_delivery_amount === undefined)
  );
}

export function hasAdminDeliveryDisplay(t: TaskDetail): boolean {
  return (
    (t.admin_delivery_amount != null && t.admin_delivery_amount !== undefined) ||
    !!t.admin_delivery_received_by_user_id ||
    !!t.admin_delivery_received_by_user_name
  );
}

export function teamMembers(t: TaskDetail): TaskUserRef[] {
  const members: TaskUserRef[] = [];
  const seen = new Set<number>();
  if (t.technician && !seen.has(t.technician.id)) {
    members.push(t.technician);
    seen.add(t.technician.id);
  }
  for (const helper of t.helping_users ?? []) {
    if (!seen.has(helper.id)) {
      members.push(helper);
      seen.add(helper.id);
    }
  }
  return members;
}

export function isTeamMemberHighlighted(
  t: TaskDetail,
  memberId: number,
  currentUserId: number | undefined
): boolean {
  if (currentUserId == null) {
    return false;
  }
  if (t.is_main_technician && t.technician?.id === memberId && currentUserId === memberId) {
    return true;
  }
  return t.is_helping_user && currentUserId === memberId;
}

export function filterTimelineEvents(
  events: TaskEvent[],
  userId: number | null,
  members: TaskUserRef[]
): TaskEvent[] {
  if (userId === null) {
    return events;
  }
  const member = members.find((m) => m.id === userId);
  return events.filter((ev) => {
    if (ev.user_id != null) {
      return ev.user_id === userId;
    }
    if (member?.name && ev.user_name) {
      return ev.user_name.trim() === member.name.trim();
    }
    return false;
  });
}

export function visibleTimelineEvents(events: TaskEvent[], showAll: boolean): TaskEvent[] {
  if (showAll || events.length <= 3) {
    return events;
  }
  return events.slice(-3);
}

export function formatPaymentAmount(amount: number | null | undefined): string {
  if (amount == null || amount === undefined) {
    return '';
  }
  return Number(amount).toFixed(2);
}
