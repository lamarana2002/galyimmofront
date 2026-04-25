import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  template: `
    <div class="error-container">
      <div class="glass-panel">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1 class="error-code">403</h1>
        <h2 class="error-title">Accès Refusé</h2>
        <p class="error-desc">
          Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur ou renouveler votre session.
        </p>
        <div class="actions">
          <button class="btn-primary" (click)="goHome()">Retour à l'accueil</button>
          <button class="btn-outline" (click)="loginAgain()">Me reconnecter</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      background: radial-gradient(circle at top right, var(--color-primary-800, #172630), var(--color-primary-900, #0e1a21));
      color: var(--color-text-inverse, #fff);
      font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
      overflow: hidden;
    }
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 1rem;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 4rem 3rem;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: float 6s ease-in-out infinite;
    }
    .icon-wrapper {
      width: 90px;
      height: 90px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, rgba(200, 114, 84, 0.2), rgba(200, 114, 84, 0.05));
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--color-secondary-500, #c87254);
      box-shadow: 0 0 30px rgba(200, 114, 84, 0.2);
    }
    .error-code {
      font-size: 5rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(to right, var(--color-secondary-400, #f2a285), var(--color-secondary-500, #c87254));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -2px;
    }
    .error-title {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0.5rem 0 1rem;
      color: var(--color-tertiary-50, #fff);
    }
    .error-desc {
      color: var(--color-tertiary-600, #d9d6d2);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
    }
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    button {
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: var(--color-secondary-500, #c87254);
      color: white;
      border: none;
      box-shadow: 0 4px 14px rgba(200, 114, 84, 0.4);
    }
    .btn-primary:hover {
      background: var(--color-secondary-600, #b06448);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(200, 114, 84, 0.5);
    }
    .btn-outline {
      background: transparent;
      color: var(--color-tertiary-200, #fefdfc);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      color: white;
      border-color: rgba(255, 255, 255, 0.4);
    }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `]
})
export class ForbiddenComponent {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/']);
  }

  loginAgain() {
    this.router.navigate(['/auth/login']);
  }
}
