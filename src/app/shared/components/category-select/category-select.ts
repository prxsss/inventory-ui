import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { CategoryOption } from '../../types/category-option';
import { ApiResponse } from '../../types/api/api-response';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-category-select',
  imports: [ReactiveFormsModule, SelectModule, SkeletonModule, ButtonModule],
  templateUrl: './category-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategorySelect {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  control = input.required<FormControl>();
  placeholder = input('Select a Category');
  filter = input(true);
  fluid = input(true);
  invalid = input(false);

  options = signal<CategoryOption[]>([]);
  loading = signal(true);
  error = signal(false);

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.error.set(false);

    this.http
      .get<ApiResponse<CategoryOption[]>>(`${environment.apiUrl}/categories/options`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.options.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }

  retry(): void {
    this.loadCategories();
  }
}
