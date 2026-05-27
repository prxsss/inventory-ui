import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, input, output, TemplateRef } from '@angular/core';
import { TableColumn } from '../../types/table-column';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-data-table',
  imports: [DatePipe, ButtonModule, TableModule, TagModule, NgTemplateOutlet],
  templateUrl: './data-table.html',
})
export class DataTable<T> {
  // Data & Structure
  columns = input.required<TableColumn[]>();
  data = input.required<T[]>();

  // Add a content child for custom cell templates from the parent component
  customCellTemplate = contentChild<TemplateRef<any>>('customCell');

  // Pagination & Loading State
  totalRecords = input<number>(0);
  loading = input<boolean>(false);
  first = input<number>(0);
  rows = input<number>(10);
  rowsPerPageOptions = input<number[]>([5, 10, 20, 25]);

  // Events (Outputs)
  onLazyLoad = output<TableLazyLoadEvent>();
  onEdit = output<T>();
  onDelete = output<T>();
}
