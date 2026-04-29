import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideCreditCard,
  lucideBanknote,
  lucideSmartphone,
  lucideLandmark,
  lucideCheckCircle
} from '@ng-icons/lucide';
import { PaymentService } from '../../../features/payments/services/payment.service';
import { CreatePaymentPayload, PaymentMethod, PaymentStatus } from '../../../features/payments/models/payment.model';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideX,
      lucideCreditCard,
      lucideBanknote,
      lucideSmartphone,
      lucideLandmark,
      lucideCheckCircle
    })
  ],
  templateUrl: './payment-modal.html',
})
export class PaymentModalComponent {
  @Input() contractId!: string;
  @Input() balanceDue: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);

  paymentForm: FormGroup;
  isSubmitting = false;

  methods: { id: PaymentMethod, label: string, icon: string }[] = [
    { id: 'mobile_money_manual', label: 'Mobile Money', icon: 'lucideSmartphone' },
    { id: 'cash', label: 'Espèces', icon: 'lucideBanknote' },
    { id: 'bank_transfer', label: 'Virement', icon: 'lucideLandmark' },
    { id: 'cheque', label: 'Chèque', icon: 'lucideCreditCard' }
  ];

  statuses: { id: PaymentStatus, label: string }[] = [
    { id: 'completed', label: 'Payé & Encaissé' },
    { id: 'pending', label: 'En attente d\'encaissement (ex: Chèque)' }
  ];

  constructor() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().substring(0, 10);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().substring(0, 10);

    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      method: ['mobile_money_manual', Validators.required],
      status: ['completed', Validators.required],
      paid_at: [today.toISOString().substring(0, 10), Validators.required],
      period_start: [firstDay, Validators.required],
      period_end: [lastDay, Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    if (this.balanceDue > 0) {
      this.paymentForm.patchValue({ amount: this.balanceDue });
    }
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.paymentForm.invalid) return;

    this.isSubmitting = true;
    const payload: CreatePaymentPayload = {
      ...this.paymentForm.value,
      contract_id: this.contractId
    };

    this.paymentService.createPayment(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.paymentSuccess.emit();
        this.onClose();
      },
      error: (err) => {
        console.error('Erreur lors du paiement', err);
        this.isSubmitting = false;
      }
    });
  }
}
