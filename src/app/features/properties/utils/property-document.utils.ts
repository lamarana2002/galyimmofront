import { PropertyDocument } from "../models/property-document.model";

export class PropertyDocumentHelper {
  static getFileSizeFormatted(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isExpired(document: PropertyDocument): boolean {
    if (!document.expiry_date) return false;
    return new Date(document.expiry_date) < new Date();
  }

  static isExpiringSoon(document: PropertyDocument, days: number = 30): boolean {
    if (!document.expiry_date) return false;
    const expiryDate = new Date(document.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= days;
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  static isPdf(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }
}