import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SaveProductRequest } from '../../types/product';
import { MessageModule } from 'primeng/message';
import { CategorySelect } from '../../../../shared/components/category-select/category-select';
import { MessageService } from 'primeng/api';
import { ProductsService } from '../../services/products-service';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadingModal } from '../../../../shared/components/loading-modal/loading-modal';

@Component({
  selector: 'app-create-product-page',
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    ButtonModule,
    MessageModule,
    CategorySelect,
    RouterLink,
    LoadingModal,
  ],
  templateUrl: './create-product-page.html',
})
export class CreateProductPage {
  private messageService = inject(MessageService);
  private productService = inject(ProductsService);
  private router = inject(Router);

  formSubmitted = signal(false);
  loading = signal(false);

  productForm = new FormGroup({
    sku: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    name: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    description: new FormControl<string | null>(null),
    price: new FormControl(1, {
      validators: [Validators.required, Validators.min(0.01)],
      nonNullable: true,
    }),
    quantity: new FormControl(0, {
      validators: [Validators.required, Validators.min(0)],
      nonNullable: true,
    }),
    lowStockThreshold: new FormControl(0, {
      validators: [Validators.required, Validators.min(0)],
      nonNullable: true,
    }),
    categoryId: new FormControl<number | null>(null, Validators.required),
  });

  onSubmit() {
    this.formSubmitted.set(true);

    if (this.productForm.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);

    const { sku, name, description, price, quantity, lowStockThreshold, categoryId } =
      this.productForm.getRawValue();

    const payload: SaveProductRequest = {
      sku,
      name,
      description,
      price,
      quantity,
      lowStockThreshold,
      categoryId: categoryId!,
    };

    this.productService
      .createProduct(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Product Created',
              detail: 'The product has been created successfully.',
            });
            this.formSubmitted.set(false);
            this.productForm.reset();
            this.router.navigate(['/products']);
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create the product.',
          });
        },
      });
  }

  isInvalid(controlName: string) {
    const control = this.productForm.get(controlName);
    return !!(control?.invalid && (control.touched || this.formSubmitted()));
  }
}
