import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-modal',
  imports: [DialogModule, ProgressSpinnerModule],
  templateUrl: './loading-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingModal {
  visible = model(false);
  message = input('Loading...');
}
