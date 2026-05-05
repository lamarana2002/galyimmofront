import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Payment, CreatePaymentPayload, ContractFinancialSummary, PaymentStatus } from '../models/payment.model';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';

export interface UnitPaymentData {
  payments: Payment[];
  summary?: ContractFinancialSummary;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE_URL}/payments`;

  // Récupérer l'historique global
  getAllPayments(params?: IQueryParam & { search?: string }): Observable<PaginatedResponse<Payment>> {
    // return this.http.get<PaginatedResponse<Payment>>(this.apiUrl, { params: this.buildParams(params) });
    return this.getMockedPaginatedPayments(params);
  }

  // Récupérer les paiements pour une unité/contrat spécifique
  getUnitPayments(unitId: string): Observable<ApiResponse<UnitPaymentData>> {
    // return this.http.get<ApiResponse<UnitPaymentData>>(`${BASE_URL}/units/${unitId}/payments`);
    return this.getMockedUnitPayments(unitId);
  }

  // Créer un paiement manuel
  createPayment(payload: CreatePaymentPayload): Observable<ApiResponse<Payment>> {
    // return this.http.post<ApiResponse<Payment>>(this.apiUrl, payload);
    const mockPayment: Payment = {
      id: Math.random().toString(36).substring(7),
      reference: `FAC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      amount: payload.amount,
      method: payload.method,
      status: payload.status,
      paid_at: payload.paid_at,
      period_start: payload.period_start,
      period_end: payload.period_end,
      contract_id: payload.contract_id,
      notes: payload.notes,
      created_at: new Date().toISOString()
    };
    return of({ success: true, message: 'Paiement enregistré avec succès', data: mockPayment }).pipe(delay(800));
  }

  // Mettre à jour le statut (ex: valider un chèque)
  updateStatus(id: string, status: PaymentStatus): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/${id}/status`, { status });
  }

  private buildParams(params?: IQueryParam & { search?: string }): HttpParams {
    let p = new HttpParams();
    if (!params) return p;

    const map: Record<string, any> = {
      page: params.page,
      per_page: params.perPage,
      search: params.search,
    };

    Object.entries(map).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, value.toString());
      }
    });

    return p;
  }

  // Mock en attendant le vrai endpoint
  private getMockedUnitPayments(unitId?: string): Observable<ApiResponse<UnitPaymentData>> {
    const mockData: Payment[] = [
      {
        id: '1', reference: 'FAC-2026-001', amount: 150000, method: 'mobile_money_manual',
        status: 'completed', paid_at: '2026-04-01T10:00:00Z', period_start: '2026-04-01', period_end: '2026-04-30', contract_id: 'c1', created_at: '2026-04-01T10:00:00Z', notes: 'Wave'
      },
      {
        id: '2', reference: 'FAC-2026-002', amount: 150000, method: 'cash',
        status: 'completed', paid_at: '2026-03-01T14:30:00Z', period_start: '2026-03-01', period_end: '2026-03-31', contract_id: 'c1', created_at: '2026-03-01T14:30:00Z'
      },
      {
        id: '3', reference: 'FAC-2026-003', amount: 150000, method: 'cheque',
        status: 'pending', paid_at: '2026-02-05T09:15:00Z', period_start: '2026-02-01', period_end: '2026-02-28', contract_id: 'c1', created_at: '2026-02-05T09:15:00Z', notes: 'Chèque N° 9876543'
      }
    ];

    const mockSummary: ContractFinancialSummary = {
      expected_rent: 450000,
      total_paid: 300000,
      balance_due: 150000
    };

    return of({ 
      success: true, 
      data: { payments: mockData, summary: mockSummary } 
    }).pipe(delay(500));
  }

  private getMockedPaginatedPayments(params?: IQueryParam & { search?: string }): Observable<PaginatedResponse<Payment>> {
    const mockData: Payment[] = [
      {
        id: '1', reference: 'FAC-2026-001', amount: 150000, method: 'mobile_money_manual',
        status: 'completed', paid_at: '2026-04-01T10:00:00Z', period_start: '2026-04-01', period_end: '2026-04-30', contract_id: 'c1', created_at: '2026-04-01T10:00:00Z', notes: 'Wave'
      },
      {
        id: '2', reference: 'FAC-2026-002', amount: 150000, method: 'cash',
        status: 'completed', paid_at: '2026-03-01T14:30:00Z', period_start: '2026-03-01', period_end: '2026-03-31', contract_id: 'c1', created_at: '2026-03-01T14:30:00Z'
      },
      {
        id: '3', reference: 'FAC-2026-003', amount: 150000, method: 'cheque',
        status: 'pending', paid_at: '2026-02-05T09:15:00Z', period_start: '2026-02-01', period_end: '2026-02-28', contract_id: 'c1', created_at: '2026-02-05T09:15:00Z', notes: 'Chèque N° 9876543'
      }
    ];

    const perPage = params?.perPage || 10;
    const page = params?.page || 1;

    const response: PaginatedResponse<Payment> = {
      current_page: page,
      data: mockData,
      first_page_url: '',
      from: 1,
      last_page: 1,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      per_page: perPage,
      prev_page_url: null,
      to: mockData.length,
      total: mockData.length
    };

    return of(response).pipe(delay(500));
  }
}
