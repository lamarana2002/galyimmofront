import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ lucideTriangleAlert, lucideX })],
  templateUrl: './confirm-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  /** Titre de la boîte de dialogue. */
  title         = input<string>('Confirmer la suppression');
  /** Message descriptif. */
  message       = input<string>('Cette action est irréversible.');
  /** Label du bouton de confirmation (danger). */
  confirmLabel  = input<string>('Supprimer');
  /** Label du bouton annuler. */
  cancelLabel   = input<string>('Annuler');
  /** Afficher un spinner sur le bouton confirm pendant le traitement. */
  loading       = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();
}
