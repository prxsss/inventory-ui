import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { StocksService } from '../services/stocks-service';
import { StockTransaction } from '../types/stock-transaction';
import {
  catchError,
  distinctUntilChanged,
  merge,
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
import { CardModule } from 'primeng/card';
import { DataTable } from '../../../shared/components/data-table/data-table';
import { TableColumn } from '../../../shared/types/table-column';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { StockFormDialog } from '../components/stock-form-dialog/stock-form-dialog';

@Component({
  selector: 'app-stock-transactions-page',
  imports: [CardModule, DataTable, TagModule, ButtonModule, StockFormDialog],
  templateUrl: './stock-transactions-page.html',
})
export class StockTransactionsPage implements OnInit {
  private stocksService = inject(StocksService);
  private messageService = inject(MessageService);

  // Inject DestroyRef to manage automatic unsubscription of observables
  private destroyRef = inject(DestroyRef);

  tableColumns: TableColumn[] = [
    { field: 'createdAt', header: 'Date', type: 'date', sortable: false, align: 'center' },
    { field: 'productName', header: 'Product', type: 'text', sortable: false },
    { field: 'type', header: 'Type', type: 'custom', sortable: false, align: 'center' },
    { field: 'quantity', header: 'Quantity', type: 'number', sortable: false, align: 'right' },
    { field: 'note', header: 'Note', type: 'text', sortable: false },
  ];
  stocks = signal<StockTransaction[]>([]);

  // Pagination state
  totalRecords = signal(0);
  rows = signal(5);
  first = signal(0);

  private lazyLoad$ = new Subject<TableLazyLoadEvent>();
  private refreshTrigger$ = new Subject<void>();

  loading = signal(false);
  isStockInMode = signal(false);
  dialogVisible = signal(false);

  dialogTitle = computed(() => (this.isStockInMode() ? 'Stock In' : 'Stock Out'));

  ngOnInit(): void {
    this.loadStockTransactions();
  }

  private loadStockTransactions() {
    const page$ = this.lazyLoad$.pipe(
      startWith({ first: this.first(), rows: this.rows() }), // Trigger initial load with current pagination state
      distinctUntilChanged((prev, curr) => prev.first === curr.first && prev.rows === curr.rows),
    );

    merge(page$, this.refreshTrigger$)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(() => {
          const pageIndex = Math.floor(this.first() / this.rows());

          return this.stocksService.getHistory({ page: pageIndex, size: this.rows() }).pipe(
            retry({
              count: 3,
              delay: 2000,
            }),
            // catchError is used to handle any errors that occur during the API call.
            // It shows an error message and returns an observable with a failure response to keep the stream alive.
            catchError((error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load products',
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
            this.stocks.set(response.data.items);
            this.totalRecords.set(response.data.pagination.totalItems);
          } else {
            this.stocks.set([]);
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

  refreshStockTransactions() {
    this.refreshTrigger$.next();
  }

  showStockInDialog() {
    this.isStockInMode.set(true);
    this.dialogVisible.set(true);
  }

  showStockOutDialog() {
    this.isStockInMode.set(false);
    this.dialogVisible.set(true);
  }
}
