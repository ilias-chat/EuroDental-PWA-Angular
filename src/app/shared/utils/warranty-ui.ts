import { WarrantyProduct } from '../../core/models/task.model';
import { warrantyStatusClass } from './task-status';

export type WarrantyStatusTone = 'valid' | 'warning' | 'expired';

export function warrantyTone(daysLeft: number): WarrantyStatusTone {
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= 30) return 'warning';
  return 'valid';
}

export function warrantyStatusColors(daysLeft: number): { bg: string; text: string } {
  return warrantyStatusClass(daysLeft);
}

export function warrantyStatusLabel(daysLeft: number): string {
  if (daysLeft <= 0) return 'EXPIRÉE';
  if (daysLeft <= 30) return 'EXPIRATION PROCHE';
  return 'VALIDE';
}

export function warrantyStatusIcon(daysLeft: number): string {
  const tone = warrantyTone(daysLeft);
  if (tone === 'expired') return 'fa-solid fa-circle-xmark';
  if (tone === 'warning') return 'fa-solid fa-triangle-exclamation';
  return 'fa-solid fa-circle-check';
}

export function warrantyTotalDays(item: WarrantyProduct): number {
  const start = new Date(item.purchase_date);
  const end = new Date(item.warranty_end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 365;
  }
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

export function warrantyProgressPercent(item: WarrantyProduct): number {
  const total = warrantyTotalDays(item);
  const left = Math.max(0, item.days_left);
  if (total <= 0) return 0;
  const pct = (left / total) * 100;
  if (left <= 0) return 0;
  return Math.min(100, Math.max(pct, 4));
}

export function formatWarrantyPurchaseDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('fr-FR');
}

export function warrantyDaysLeftLabel(item: WarrantyProduct): string {
  const total = warrantyTotalDays(item);
  const left = Math.max(0, item.days_left);
  return `${left} / ${total} jours restants`;
}
