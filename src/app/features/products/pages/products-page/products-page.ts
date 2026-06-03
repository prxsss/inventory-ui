import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products-service';
import { TableColumn } from '../../../../shared/types/table-column';
import { Product } from '../../types/product';
import { TableLazyLoadEvent } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  merge,
  of,
  retry,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products-page',
  imports: [
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CardModule,
    TagModule,
    DataTable,
    ReactiveFormsModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './products-page.html',
})
export class ProductsPage implements OnInit {
  private productsService = inject(ProductsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  // Inject DestroyRef to manage automatic unsubscription of observables
  private destroyRef = inject(DestroyRef);

  tableColumns: TableColumn[] = [
    { field: 'sku', header: 'SKU', type: 'custom', sortable: true },
    { field: 'name', header: 'Name', type: 'text', sortable: true },
    { field: 'categoryName', header: 'Category', type: 'text', sortable: true },
    { field: 'price', header: 'Price', type: 'number', sortable: true, align: 'right' },
    { field: 'quantity', header: 'Quantity', type: 'number', sortable: true, align: 'right' },
    { field: 'status', header: 'Status', type: 'custom', sortable: false, align: 'center' },
  ];
  products = signal<Product[]>([]);
  searchControl = new FormControl('');

  // Pagination state
  totalRecords = signal(0);
  rows = signal(5);
  first = signal(0);

  // Sorting state
  sortField = signal<string | undefined>('sku');
  sortOrder = signal<number | undefined>(1);

  // Subjects to trigger actions in the search stream
  private lazyLoad$ = new Subject<TableLazyLoadEvent>();
  private refreshTrigger$ = new Subject<void>();

  loading = signal(false);
  deleting = signal(false);

  ngOnInit(): void {
    this.setupSearchStream();
  }

  private setupSearchStream(): void {
    const search$ = this.searchControl.valueChanges.pipe(debounceTime(500), distinctUntilChanged());

    const page$ = this.lazyLoad$.pipe(
      distinctUntilChanged(
        (prev, curr) =>
          prev.first === curr.first &&
          prev.rows === curr.rows &&
          prev.sortField === curr.sortField &&
          prev.sortOrder === curr.sortOrder,
      ),
    );

    merge(search$, this.refreshTrigger$, page$)
      .pipe(
        // startWith('') is used to trigger the initial load of products immediately without waiting for user input
        startWith(this.searchControl.value),

        // Set loading to true before making the API call
        tap(() => this.loading.set(true)),

        // switchMap helps to automatically cancel previous requests and prevent race conditions
        switchMap(() => {
          const pageIndex = Math.floor(this.first() / this.rows());

          const direction =
            this.sortOrder() === 1 ? 'ASC' : this.sortOrder() === -1 ? 'DESC' : undefined;

          return this.productsService
            .getProducts({
              keyword: this.searchControl.value || '',
              page: pageIndex,
              size: this.rows(),
              sortBy: this.sortField(),
              direction: direction,
            })
            .pipe(
              // retry is used to automatically retry the API call a few times in case of transient errors, improving reliability
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
        takeUntilDestroyed(this.destroyRef), // Automatically unsubscribe when the component is destroyed
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.products.set(response.data.items);
            this.totalRecords.set(response.data.pagination.totalItems);
          } else {
            this.products.set([]);
            this.totalRecords.set(0);
          }
          this.loading.set(false);
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const currentFirst = event.first ?? 0;
    const currentRows = event.rows ?? 10;
    const currentSortField = event.sortField as string | undefined;
    const currentSortOrder = event.sortOrder as number | undefined;

    // Update the Signals so they can be used in the switchMap for API calls
    this.first.set(currentFirst);
    this.rows.set(currentRows);
    this.sortField.set(currentSortField);
    this.sortOrder.set(currentSortOrder);

    this.lazyLoad$.next(event);
  }

  refreshProducts(): void {
    this.refreshTrigger$.next();
  }

  navigateToCreate(): void {
    this.router.navigate(['/products/create']);
  }

  navigateToEdit(product: Product): void {
    this.router.navigate([`/products/${product.id}/edit`]);
  }

  confirmDelete(product: Product): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${product.name}"?`,
      header: 'Delete Product',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'No',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Yes',
        severity: 'danger',
        loading: this.deleting(),
        disabled: this.deleting(),
      },
      accept: () => {
        this.deleteProduct(product.id);
      },
    });
  }

  private deleteProduct(id: number): void {
    this.deleting.set(true);

    this.productsService
      .deleteProduct(id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product deleted',
            });
            this.refreshProducts();
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete product',
          });
        },
      });
  }
}
