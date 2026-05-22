import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';

import { DashboardService } from '../../services/dashboard-service';
import { InventorySummary } from '../../types/inventory-summary';

@Component({
  selector: 'app-dashboard-page',
  imports: [CardModule],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);

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

  ngOnInit(): void {
    this.getSummary();
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

  cardPt = {
    body: {
      class: 'p-7',
    },
  };
}
