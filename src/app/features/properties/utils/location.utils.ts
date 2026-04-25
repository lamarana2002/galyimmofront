import { LocationStatusEnum } from "../enums/location-status.enum";

export class LocationHelper {
    static getStatusBadgeClass(status: string): string {
    return (
      (
        {
          active: 'bg-green-100 text-green-700 border-green-200',
          expired: 'bg-gray-100 text-gray-500 border-gray-200',
          terminated: 'bg-red-100 text-red-600 border-red-200',
          pending: 'bg-amber-100 text-amber-700 border-amber-200',
        } as Record<string, string>
      )[status] ?? 'bg-gray-100 text-gray-500 border-gray-200'
    );
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
}