import { Component, ChangeDetectionStrategy, effect, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './category-form-dialog.html',
})
export class CategoryFormDialogComponent {
  // visibility control (two-way bound)
  visible = model(false);

  // Dialog configuration
  dialogTitle = input.required<string>();
  initialName = input<string>('');

  // Event emitter for passing the saved name
  onSave = output<string>();

  // Local state for the input field
  categoryName = signal('');

  constructor() {
    // When initialName changes (e.g. parent clicked edit), we reset the local name state
    effect(() => {
      this.categoryName.set(this.initialName());
    });
  }

  handleSave() {
    const name = this.categoryName().trim();
    if (name) {
      this.onSave.emit(name);
    }
  }

  handleHide() {
    this.categoryName.set('');
  }
}
