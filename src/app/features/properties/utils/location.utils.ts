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
}