import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit {

  form = { login: '', password: '' };

  showPassword   = signal(false);
  submitted      = signal(false);
  loading        = signal(false);
  errorMessage   = signal('');
  sessionExpired = signal(false);

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Détecter si redirection pour session expirée
    this.sessionExpired.set(this.route.snapshot.queryParamMap.get('reason') === 'session_expired');
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  submit(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (!this.form.login || !this.form.password) return;

    this.loading.set(true);
    this.authService.login(this.form).subscribe({
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Login ou mot de passe incorrect.');
      }
    });
  }
}