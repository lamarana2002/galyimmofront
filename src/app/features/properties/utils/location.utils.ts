import { LocationStatusEnum } from "../enums/location-status.enum";

export class LocationHelper {
    static getStatusBadgeClass(status: string): string {
    const map: Record<LocationStatusEnum, string> = {
      [LocationStatusEnum.ACTIVE]: 'bg-green-100 text-green-700 border-green-200',
      [LocationStatusEnum.EXPIRED]: 'bg-gray-100 text-gray-500 border-gray-200',
      [LocationStatusEnum.TERMINATED]: 'bg-red-100 text-red-600 border-red-200',
      [LocationStatusEnum.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return map[status as LocationStatusEnum] ?? 'bg-gray-100 text-gray-500 border-gray-200';
  }

  static getStatusLabel(status: string): string {
    const map: Record<LocationStatusEnum, string> = {
      [LocationStatusEnum.ACTIVE]: 'Actif',
      [LocationStatusEnum.EXPIRED]: 'Expiré',
      [LocationStatusEnum.TERMINATED]: 'Résilié',
      [LocationStatusEnum.PENDING]: 'En attente',
    };
    return map[status as LocationStatusEnum] ?? '—';
  }

  static getPaymentStatusBadgeClass(status?: string | null): string {
    const map: Record<string, string> = {
      'en retard': 'bg-red-100 text-red-600 border-red-200',
      'a jour': 'bg-green-100 text-green-700 border-green-200',
      'paye': 'bg-green-100 text-green-700 border-green-200',
      'en attente': 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return map[status ?? ''] ?? 'bg-gray-100 text-gray-500 border-gray-200';
  }

  static getPaymentStatusLabel(status?: string | null): string {
    if (!status) return '—';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // jours_restants négatif = échéance dépassée (retard), positif = jours avant échéance
  static getJoursRestantsLabel(jours?: number | null): string | null {
    if (jours === null || jours === undefined) return null;
    if (jours < 0) return `Retard de ${Math.abs(jours)} j`;
    if (jours === 0) return "Échéance aujourd'hui";
    return `Échéance dans ${jours} j`;
  }
}