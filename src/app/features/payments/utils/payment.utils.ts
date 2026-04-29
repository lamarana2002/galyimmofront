export function formatPaymentPeriod(start: string | undefined | null, end: string | undefined | null): string {
  if (!start || !end) return 'N/A';
  const d1 = new Date(start);
  const d2 = new Date(end);
  
  const isSameMonth = d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  const isFullMonth = d1.getDate() === 1 && 
    d2.getDate() === new Date(d2.getFullYear(), d2.getMonth() + 1, 0).getDate();

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  if (isSameMonth && isFullMonth) {
    return `${monthNames[d1.getMonth()]} ${d1.getFullYear()}`;
  } else if (isSameMonth) {
    return `Du ${d1.getDate()} au ${d2.getDate()} ${monthNames[d1.getMonth()]} ${d1.getFullYear()}`;
  } else {
    return `${monthNames[d1.getMonth()]} ${d1.getFullYear()} - ${monthNames[d2.getMonth()]} ${d2.getFullYear()}`;
  }
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    'cash': 'Espèces',
    'cheque': 'Chèque',
    'bank_transfer': 'Virement',
    'mobile_money_manual': 'Mobile Money'
  };
  return labels[method] || method;
}
