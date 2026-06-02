export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'custom';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}
