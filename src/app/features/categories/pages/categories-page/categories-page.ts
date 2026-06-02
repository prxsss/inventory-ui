import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  retry,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { CategoriesService } from '../../services/categories-service';
import { Category } from '../../types/category';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { TableColumn } from '../../../../shared/types/table-column';

import { CategoryFormDialogComponent } from '../../components/category-form-dialog/category-form-dialog';

@Component({
  selector: 'app-categories-page',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ToastModule,
    TooltipModule,
    CardModule,
    DataTable,
    CategoryFormDialogComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './categories-page.html',
})
export class CategoriesPage implements OnInit {
  private categoriesService = inject(CategoriesService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Inject DestroyRef to manage automatic unsubscription of observables
  private destroyRef = inject(DestroyRef);

  tableColumns: TableColumn[] = [
    { field: 'name', header: 'Name', type: 'text' },
    { field: 'createdAt', header: 'Created', type: 'date' },
  ];
  categories = signal<Category[]>([]);
  searchControl = new FormControl('');

  // Pagination state
  totalRecords = signal(0);
  rows = signal(5);
  first = signal(0);

  // Subjects to trigger actions in the search stream
  private pageChange$ = new Subject<{ first: number; rows: number }>();
  private refreshTrigger$ = new Subject<void>();

  loading = signal(false);
  deleting = signal(false);
  dialogVisible = signal(false);
  isEditMode = signal(false);
  selectedCategory = signal<Category | null>(null);

  dialogTitle = computed(() => (this.isEditMode() ? 'Edit Category' : 'Add Category'));

  ngOnInit(): void {
    this.setupSearchStream();
  }

  private setupSearchStream(): void {
    const search$ = this.searchControl.valueChanges.pipe(debounceTime(500), distinctUntilChanged());

    const page$ = this.pageChange$.pipe(
      // prev and curr are the previous and current pagination states,
      // we only want to trigger a new search if either the page index (first) or page size (rows) has changed
      distinctUntilChanged((prev, curr) => prev.first === curr.first && prev.rows === curr.rows),
    );

    merge(search$, this.refreshTrigger$, page$)
      .pipe(
        // startWith('') is used to trigger the initial load of categories immediately without waiting for user input
        startWith(this.searchControl.value),

        // Set loading to true before making the API call
        tap(() => this.loading.set(true)),

        // switchMap helps to automatically cancel previous requests and prevent race conditions
        switchMap(() => {
          const pageIndex = Math.floor(this.first() / this.rows());

          return this.categoriesService
            .getCategories({
              keyword: this.searchControl.value || '',
              page: pageIndex,
              size: this.rows(),
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
                  detail: 'Failed to load categories',
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
            this.categories.set(response.data.items);
            this.totalRecords.set(response.data.pagination.totalItems);
          } else {
            this.categories.set([]);
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

    // Trigger the page change subject to load the new page of categories
    this.pageChange$.next({ first: currentFirst, rows: currentRows });
  }

  // This method can be called to manually trigger a refresh of the categories list,
  // for example after adding/editing/deleting a category
  refreshCategories(): void {
    this.refreshTrigger$.next();
  }

  showAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedCategory.set(null);
    this.dialogVisible.set(true);
  }

  showEditDialog(category: Category): void {
    this.isEditMode.set(true);
    this.selectedCategory.set(category);
    this.dialogVisible.set(true);
  }

  saveCategory(name: string): void {
    if (!name) return;

    if (this.isEditMode()) {
      const category = this.selectedCategory();
      if (!category) return;
      this.categoriesService.updateCategory(category.id, { name }).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category updated',
            });
            this.dialogVisible.set(false);
            this.refreshCategories();
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update category',
          });
        },
      });
    } else {
      this.categoriesService.createCategory({ name }).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category created',
            });
            this.dialogVisible.set(false);
            this.refreshCategories();
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create category',
          });
        },
      });
    }
  }

  confirmDelete(category: Category): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"?`,
      header: 'Delete Category',
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
        this.deleteCategory(category.id);
      },
    });
  }

  private deleteCategory(id: string): void {
    this.deleting.set(true);

    this.categoriesService
      .deleteCategory(id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category deleted',
            });
            this.refreshCategories();
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete category',
          });
        },
      });
  }
}
