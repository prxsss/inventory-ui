import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { DashboardService } from '../../services/dashboard-service';
import { InventorySummary } from '../../types/inventory-summary';
import { ReportsService } from '../../../reports/services/reports-service';
import { LowStockProduct } from '../../../reports/types/low-stock-product';
import { StocksService } from '../../../stocks/services/stocks-service';
import { StockTransaction } from '../../../stocks/types/stock-transaction';

@Component({
  selector: 'app-dashboard-page',
  imports: [CardModule, ButtonModule, RouterLink, TableModule, TagModule],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);
  private reportsService = inject(ReportsService);
  private stocksService = inject(StocksService);

  stats = signal<InventorySummary>({
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    totalQuantity: 0,
  });

  totalProducts = computed(() => this.stats().totalProducts);
  totalCategories = computed(() => this.stats().totalCategories);
  lowStockProducts = computed(() => this.stats().lowStockProducts);
  totalQuantity = computed(() => this.stats().totalQuantity);

  statCards = computed(() => [
    {
      label: 'Total Products',
      value: this.totalProducts(),
      icon: 'pi pi-box',
      colorClass: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Categories',
      value: this.totalCategories(),
      icon: 'pi pi-tag',
      colorClass: 'bg-green-100 text-green-600',
    },
    {
      label: 'Low Stock Products',
      value: this.lowStockProducts(),
      icon: 'pi pi-exclamation-triangle',
      colorClass: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Total Quantity',
      value: this.totalQuantity(),
      icon: 'pi pi-database',
      colorClass: 'bg-purple-100 text-purple-600',
    },
  ]);

  lowStockItems = signal<LowStockProduct[]>([]);
  recentTransactions = signal<StockTransaction[]>([]);

  ngOnInit(): void {
    this.getSummary();
    this.getLowStockProducts();
    this.getRecentTransactions();
  }

  getSummary() {
    this.dashboardService.getSummary().subscribe({
      next: (response) => {
        console.log('Summary data:', response);

        if (response.success && response.data) {
          this.stats.set(response.data);
        }
      },
    });
  }

  getLowStockProducts() {
    this.reportsService.getLowStockProducts({ page: 0, size: 5 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lowStockItems.set(response.data.items);
        }
      },
    });
  }

  getRecentTransactions() {
    this.stocksService.getHistory({ page: 0, size: 10 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentTransactions.set(response.data.items);
        }
      },
    });
  }

  cardPt = {
    body: {
      class: 'p-7',
    },
  };
}
