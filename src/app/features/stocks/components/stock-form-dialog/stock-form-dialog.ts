import { Component, inject, input, model, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProductSelect } from '../../../../shared/components/product-select/product-select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { StocksService } from '../../services/stocks-service';
import { CreateStockTransactionRequest, StockTransactionType } from '../../types/stock-transaction';
import { finalize } from 'rxjs';
import { MessageModule } from 'primeng/message';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../../shared/types/api/api-response';

@Component({
  selector: 'app-stock-form-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    ProductSelect,
    InputNumberModule,
    TextareaModule,
    ReactiveFormsModule,
    MessageModule,
  ],
  templateUrl: './stock-form-dialog.html',
})
export class StockFormDialog {
  private messageService = inject(MessageService);
  private stocksService = inject(StocksService);

  visible = model(false);
  formSubmitted = model(false);
  loading = model(false);

  dialogTitle = input.required<string>();
  type = input.required<StockTransactionType>();

  onSaveSuccess = output<void>();

  errorCode = signal<string | null>(null);

  stockForm = new FormGroup({
    productId: new FormControl<number | null>(null, Validators.required),
    quantity: new FormControl<number>(1, {
      validators: [Validators.required, Validators.min(1)],
      nonNullable: true,
    }),
    note: new FormControl<string | null>(null),
  });

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.stockForm.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);

    const { productId, quantity, note } = this.stockForm.getRawValue();
    const transactionType = this.type();

    const payload: CreateStockTransactionRequest = {
      productId: productId!,
      type: transactionType,
      quantity,
      note,
    };

    const stockOperation$ =
      transactionType === 'IN'
        ? this.stocksService.stockIn(payload)
        : this.stocksService.stockOut(payload);

    stockOperation$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        const detailMsg =
          transactionType === 'IN'
            ? 'Stock has been added successfully.'
            : 'Stock has been removed successfully.';

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: detailMsg,
        });

        this.visible.set(false);
        this.onSaveSuccess.emit();
      },
      error: (error: HttpErrorResponse) => this.handleError(error, transactionType),
    });
  }

  handleHide() {
    this.formSubmitted.set(false);
    this.errorCode.set(null);
    this.stockForm.reset({
      productId: null,
      quantity: 1,
      note: null,
    });
  }

  isInvalid(controlName: string) {
    const control = this.stockForm.get(controlName);
    return !!(control?.invalid && (control.touched || this.formSubmitted()));
  }

  private handleError(httpError: HttpErrorResponse, type: StockTransactionType): void {
    const apiError = httpError.error as ApiErrorResponse;

    if (apiError?.error) {
      this.errorCode.set(apiError.error.code);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: apiError.error.message,
      });
    } else {
      const fallbackMsg = type === 'IN' ? 'Failed to add stock.' : 'Failed to remove stock.';
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `${fallbackMsg} Please try again.`,
      });
    }
  }
}
