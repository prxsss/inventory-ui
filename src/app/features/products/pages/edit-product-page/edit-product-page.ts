import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { CategorySelect } from '../../../../shared/components/category-select/category-select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProductsService } from '../../services/products-service';
import { finalize } from 'rxjs';
import { LoadingModal } from '../../../../shared/components/loading-modal/loading-modal';
import { SaveProductRequest } from '../../types/product';

@Component({
  selector: 'app-edit-product-page',
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
  templateUrl: './edit-product-page.html',
})
export class EditProductPage implements OnInit {
  private messageService = inject(MessageService);
  private productService = inject(ProductsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formSubmitted = signal(false);
  loading = signal(false);

  productId = Number(this.route.snapshot.paramMap.get('id'));

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

  ngOnInit() {
    this.loadProduct();
  }

  private loadProduct() {
    this.loading.set(true);

    this.productService
      .getProduct(this.productId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            return;
          }

          const product = response.data;

          this.productForm.patchValue({
            sku: product.sku,
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            lowStockThreshold: product.lowStockThreshold,
            categoryId: product.categoryId,
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load product.',
          });

          this.router.navigate(['/products']);
        },
      });
  }

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
      .updateProduct(this.productId, payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Product Updated',
              detail: 'The product has been updated successfully.',
            });

            this.formSubmitted.set(false);

            this.router.navigate(['/products']);
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update the product.',
          });
        },
      });
  }

  isInvalid(controlName: string) {
    const control = this.productForm.get(controlName);
    return !!(control?.invalid && (control.touched || this.formSubmitted()));
  }
}
