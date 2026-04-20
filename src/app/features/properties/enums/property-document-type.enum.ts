export enum PropertyDocumentTypeEnum {
  TITLE_DEED = 'title_deed',
  PURCHASE_ACT = 'purchase_act',
  PROPERTY_TAX = 'property_tax',
  INSURANCE = 'insurance',
  FLOOR_PLAN = 'floor_plan',
  TECHNICAL_REPORT = 'technical_report',
  CO_OWNERSHIP_RULES = 'co_ownership_rules',
  OTHER = 'other',
}

export const PropertyDocumentTypeLabels: Record<PropertyDocumentTypeEnum, string> = {
  [PropertyDocumentTypeEnum.TITLE_DEED]: 'Titre Foncier',
  [PropertyDocumentTypeEnum.PURCHASE_ACT]: "Acte d'achat / Vente",
  [PropertyDocumentTypeEnum.PROPERTY_TAX]: 'Taxe Foncière',
  [PropertyDocumentTypeEnum.INSURANCE]: 'Assurance Immobilère',
  [PropertyDocumentTypeEnum.FLOOR_PLAN]: 'Plan de masse / Architecte',
  [PropertyDocumentTypeEnum.TECHNICAL_REPORT]: 'Rapport technique / Diagnostic',
  [PropertyDocumentTypeEnum.CO_OWNERSHIP_RULES]: 'Règlement de copropriété',
  [PropertyDocumentTypeEnum.OTHER]: 'Autre document',
};

export function hasExpiryDate(type: PropertyDocumentTypeEnum): boolean {
  return [
    PropertyDocumentTypeEnum.INSURANCE,
    PropertyDocumentTypeEnum.TECHNICAL_REPORT
  ].includes(type);
}
