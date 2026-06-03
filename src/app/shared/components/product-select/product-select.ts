import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductOption } from '../../types/product-option';
import { ApiResponse } from '../../types/api/api-response';
import { environment } from '../../../../environments/environment.development';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-product-select',
  imports: [ReactiveFormsModule, SelectModule, SkeletonModule, ButtonModule, TagModule],
  templateUrl: './product-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelect implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  control = input.required<FormControl>();
  placeholder = input('Select a Product');
  filter = input(true);
  fluid = input(true);
  invalid = input(false);

  options = signal<ProductOption[]>([]);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(false);

    this.http
      .get<ApiResponse<ProductOption[]>>(`${environment.apiUrl}/products/options`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.options.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  retry(): void {
    this.loadProducts();
  }
}
