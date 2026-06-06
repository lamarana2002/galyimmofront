import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideRotateCcw,
  lucideBanknote,
  lucideSmartphone,
  lucideLandmark,
  lucideCreditCard,
} from '@ng-icons/lucide';
import { RenewLocationPayload } from '../../../features/properties/interfaces/renew-location-payload.interface';

export type { RenewLocationPayload };

@Component({
  selector: 'app-renew-location-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, DecimalPipe],
  providers: [
    provideIcons({
      lucideX,
      lucideRotateCcw,
      lucideBanknote,
      lucideSmartphone,
      lucideLandmark,
      lucideCreditCard,
    }),
  ],
  templateUrl: './renew-location-modal.html',
})
export class RenewLocationModal implements OnInit {
  @Input() rentAmount: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<RenewLocationPayload>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  isSubmitting = false;

  methods = [
    { id: 'mobile_money', label: 'Mobile Money', icon: 'lucideSmartphone' },
    { id: 'cash',          label: 'Espèces',      icon: 'lucideBanknote'  },
    { id: 'virement',      label: 'Virement',     icon: 'lucideLandmark'  },
    { id: 'cheque',        label: 'Chèque',       icon: 'lucideCreditCard'},
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      interval:         [1,   [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]],
      methode_payement: ['mobile_money', Validators.required],
      montant_recu:     [this.rentAmount, [Validators.min(0)]],
      description:      [''],
    });

    // Recalcule montant_recu quand interval change
    this.form.get('interval')?.valueChanges.subscribe(val => {
      const months = parseInt(val, 10) || 1;
      this.form.get('montant_recu')?.setValue(this.rentAmount * months, { emitEvent: false });
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;

    const raw = this.form.value;
    const payload: RenewLocationPayload = {
      interval:         Number(raw.interval),
      methode_payement: raw.methode_payement,
      montant_recu:     raw.montant_recu ?? undefined,
      description:      raw.description || undefined,
    };

    this.confirmed.emit(payload);
  }

  stopSubmit(): void {
    this.isSubmitting = false;
  }
}
