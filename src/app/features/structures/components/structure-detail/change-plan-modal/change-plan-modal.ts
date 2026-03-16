import { Component, Input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { StructurePlanType } from '../../../enums/structure-plan-type.enum';

@Component({
  selector: 'app-change-plan-modal',
  imports: [NgIcon, FormsModule],
  templateUrl: './change-plan-modal.html',
  styleUrl: './change-plan-modal.css',
})
export class ChangePlanModal {
  @Input() showPlanModal = false;
  confirmChange = output<StructurePlanType>();
  selectedPlan: StructurePlanType = StructurePlanType.PREMIUM;
  cancel = output();

  onConfirmChangePlan(): void {
    this.confirmChange.emit(this.selectedPlan);
  }
  onCancel(){
    this.cancel.emit();
  }
}
