import { Component, Input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { PlanType } from '../../../pages/structure-details/structure-details';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-plan-modal',
  imports: [NgIcon, FormsModule],
  templateUrl: './change-plan-modal.html',
  styleUrl: './change-plan-modal.css',
})
export class ChangePlanModal {
  @Input() showPlanModal = false;
  confirmChange = output<PlanType>();
  selectedPlan: PlanType = 'premium';
  cancel = output();

  onConfirmChangePlan(): void {
    this.confirmChange.emit(this.selectedPlan);
  }
  onCancel(){
    this.cancel.emit();
  }
}
