import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private allowedRoles: string[] = [];
  private hasView = false;

  @Input() set appHasRole(roles: string[] | string) {
    this.allowedRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  constructor() {
    // Rend la directive réactive : si l'utilisateur change de rôle, la vue se met à jour.
    effect(() => {
      // Lit le signal userRoles pour trigger l'effect
      this.authService.userRoles();
      this.updateView();
    });
  }

  private updateView() {
    if (this.authService.hasAnyRole(this.allowedRoles) && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!this.authService.hasAnyRole(this.allowedRoles) && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
