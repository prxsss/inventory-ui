import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { ReportsService } from '../../services/reports-service';
import { TableColumn } from '../../../../shared/types/table-column';
import { LowStockProduct } from '../../types/low-stock-product';
import {
  catchError,
  count,
  distinctUntilChanged,
  of,
  retry,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-low-stock-products-page',
  imports: [CardModule, DataTable, ButtonModule, RouterLink],
  templateUrl: './low-stock-products-page.html',
})
export class LowStockProductsPage implements OnInit {
  private reportsService = inject(ReportsService);
  private messageService = inject(MessageService);

  private destroyRef = inject(DestroyRef);

  tableColumns: TableColumn[] = [
    { field: 'name', header: 'Product Name', type: 'text', sortable: false },
    { field: 'quantity', header: 'Quantity', type: 'number', sortable: false, align: 'right' },
    {
      field: 'lowStockThreshold',
      header: 'Low Stock Threshold',
      type: 'number',
      sortable: false,
      align: 'right',
    },
  ];
  lowStockProducts = signal<LowStockProduct[]>([]);

  // Pagination state
  totalRecords = signal(0);
  rows = signal(10);
  first = signal(0);

  private lazyLoad$ = new Subject<TableLazyLoadEvent>();

  loading = signal(false);

  ngOnInit(): void {
    this.loadLowStockProducts();
  }

  private loadLowStockProducts() {
    const page$ = this.lazyLoad$.pipe(
      startWith({ first: this.first(), rows: this.rows() }),
      distinctUntilChanged((prev, curr) => prev.first === curr.first && prev.rows === curr.rows),
    );

    page$
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(() => {
          const pageIndex = Math.floor(this.first() / this.rows());

          return this.reportsService
            .getLowStockProducts({ page: pageIndex, size: this.rows() })
            .pipe(
              retry({
                count: 3,
                delay: 2000,
              }),
              catchError((error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to load low stock products.',
                });
                return of({ success: false, data: null });
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.lowStockProducts.set(response.data.items);
            this.totalRecords.set(response.data.pagination.totalItems);
          } else {
            this.lowStockProducts.set([]);
            this.totalRecords.set(0);
          }
          this.loading.set(false);
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const currentFirst = event.first ?? 0;
    const currentRows = event.rows ?? 10;

    // Update the Signals so they can be used in the switchMap for API calls
    this.first.set(currentFirst);
    this.rows.set(currentRows);

    this.lazyLoad$.next(event);
  }
}
