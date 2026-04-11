import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private allowedPermissions: string[] = [];
  private hasView = false;

  @Input() set appHasPermission(permissions: string[] | string) {
    this.allowedPermissions = Array.isArray(permissions) ? permissions : [permissions];
    this.updateView();
  }

  constructor() {
    effect(() => {
      // Lit le signal userPermissions pour trigger l'effect
      this.authService.userPermissions();
      this.updateView();
    });
  }

  private updateView() {
    if (this.authService.hasAnyPermission(this.allowedPermissions) && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!this.authService.hasAnyPermission(this.allowedPermissions) && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
