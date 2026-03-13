import { Component, OnInit } from '@angular/core';
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

  showPassword  = false;
  submitted     = false;
  loading       = false;
  errorMessage  = '';
  sessionExpired = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Détecter si redirection pour session expirée
    this.sessionExpired = this.route.snapshot.queryParamMap.get('reason') === 'session_expired';
  }

  submit(): void {
    this.submitted    = true;
    this.errorMessage = '';

    if (!this.form.login || !this.form.password) return;

    this.loading = true;
    this.authService.login(this.form).subscribe({
      error: (err) => {
        console.log(err);
        
        this.loading = false;
        this.errorMessage = err?.error?.message ?? 'Login ou mot de passe incorrect.';
      }
    });
  }
}