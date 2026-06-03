import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { LoadingModal } from '../../../../shared/components/loading-modal/loading-modal';
import { ProductsService } from '../../services/products-service';
import { StocksService } from '../../../stocks/services/stocks-service';
import { Product } from '../../types/product';
import { StockTransaction } from '../../../stocks/types/stock-transaction';
import { TableColumn } from '../../../../shared/types/table-column';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-product-details-page',
  imports: [
    CardModule,
    TagModule,
    DecimalPipe,
    DatePipe,
    DataTable,
    LoadingModal,
    ToastModule,
    ButtonModule,
    RouterLink,
  ],
  providers: [MessageService],
  templateUrl: './product-details-page.html',
})
export class ProductDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private stocksService = inject(StocksService);
  private messageService = inject(MessageService);

  productId = Number(this.route.snapshot.paramMap.get('id'));

  product = signal<Product | null>(null);
  stockHistory = signal<StockTransaction[]>([]);
  loading = signal(false);
  loadingHistory = signal(false);

  totalRecords = signal(0);
  rows = signal(10);
  first = signal(0);

  stockHistoryColumns: TableColumn[] = [
    { field: 'type', header: 'Type', type: 'custom' },
    { field: 'quantity', header: 'Quantity', type: 'number', align: 'right' },
    { field: 'note', header: 'Note', type: 'text' },
    { field: 'createdAt', header: 'Date', type: 'date' },
  ];

  ngOnInit(): void {
    this.loadProduct();
    this.loadStockHistory();
  }

  private loadProduct(): void {
    this.loading.set(true);
    this.productsService
      .getProduct(this.productId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.product.set(response.data);
          }
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

  private loadStockHistory(): void {
    this.loadingHistory.set(true);
    const pageIndex = Math.floor(this.first() / this.rows());
    this.stocksService
      .getHistoryByProductId(this.productId, {
        page: pageIndex,
        size: this.rows(),
      })
      .pipe(finalize(() => this.loadingHistory.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.stockHistory.set(response.data.items);
            this.totalRecords.set(response.data.pagination.totalItems);
          }
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
    this.loadStockHistory();
  }
}
