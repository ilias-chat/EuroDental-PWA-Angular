import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, IonRefresher, IonRefresherContent, IonSpinner } from '@ionic/angular/standalone';
import { ProductApiService } from '@core/services/product-api.service';
import { ProductListItem, ProductsPagination } from '@core/models/product.model';
import {
  formatProductPrice,
  paginationSummary,
  stockLevel,
} from '../utils/stock-display';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [IonContent, IonRefresher, IonRefresherContent, IonSpinner],
  templateUrl: './stock-list.page.html',
  styleUrl: './stock-list.page.scss',
})
export class StockListPage implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly searching = signal(false);
  readonly error = signal<string | null>(null);
  readonly products = signal<ProductListItem[]>([]);
  readonly pagination = signal<ProductsPagination | null>(null);
  readonly searchQuery = signal('');
  readonly stockLevel = stockLevel;
  readonly formatProductPrice = formatProductPrice;
  readonly paginationSummary = paginationSummary;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private requestId = 0;

  ngOnInit(): void {
    this.loadPage(1);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadPage(1, true), 500);
  }

  load(event?: CustomEvent, page = 1, fromSearch = false): void {
    const current = ++this.requestId;
    if (fromSearch) {
      this.searching.set(true);
    } else {
      this.loading.set(true);
    }
    this.error.set(null);

    this.productApi
      .getProducts({ page, search: this.searchQuery() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (current !== this.requestId) return;
          this.products.set(res.products ?? []);
          this.pagination.set(res.pagination ?? null);
          this.loading.set(false);
          this.searching.set(false);
          event?.target && (event.target as HTMLIonRefresherElement).complete();
        },
        error: () => {
          if (current !== this.requestId) return;
          this.error.set('Impossible de charger le stock. Tirez vers le bas pour réessayer.');
          this.products.set([]);
          this.pagination.set(null);
          this.loading.set(false);
          this.searching.set(false);
          event?.target && (event.target as HTMLIonRefresherElement).complete();
        },
      });
  }

  goToPage(page: number): void {
    const p = this.pagination();
    if (!p || page < 1 || page > p.last_page || page === p.current_page) return;
    this.loadPage(page);
  }

  private loadPage(page: number, fromSearch = false): void {
    this.load(undefined, page, fromSearch);
  }

  stockBadgeClass(quantity: number | null | undefined): string {
    const level = stockLevel(quantity);
    return `stock-badge stock-badge--${level}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const wrap = img.parentElement;
    if (wrap) {
      wrap.classList.add('product-thumb--fallback');
    }
  }

  pageNumbers(): number[] {
    const p = this.pagination();
    if (!p || p.last_page <= 1) return [];
    const start = Math.max(p.current_page - 2, 1);
    const end = Math.min(p.current_page + 2, p.last_page);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  showLeadingEllipsis(): boolean {
    const p = this.pagination();
    if (!p) return false;
    const start = Math.max(p.current_page - 2, 1);
    return start > 2;
  }

  showTrailingEllipsis(): boolean {
    const p = this.pagination();
    if (!p) return false;
    const end = Math.min(p.current_page + 2, p.last_page);
    return end < p.last_page - 1;
  }
}
