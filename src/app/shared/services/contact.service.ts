import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants/app.constant';
import { ApiResponse } from '../interfaces/api-response.interface';

export interface SendEmailPayload {
  email: string;   // Destinataire (attendu par le back)
  subject: string; // Sujet
  body: string;    // Contenu (attendu par le back)
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/send-email`;

  sendEmail(payload: SendEmailPayload): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(this.baseUrl, payload);
  }
}
