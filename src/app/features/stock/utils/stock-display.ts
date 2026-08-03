export type StockLevel = 'high' | 'medium' | 'low';

export function stockLevel(quantity: number | null | undefined): StockLevel {
  const q = quantity ?? 0;
  if (q > 10) return 'high';
  if (q > 5) return 'medium';
  return 'low';
}

export function formatProductPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(price)) {
    return 'Prix non défini';
  }
  return (
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price) + ' MAD'
  );
}

export function paginationSummary(from: number | null, to: number | null, total: number): string {
  if (from == null || to == null || total === 0) {
    return 'Aucun résultat';
  }
  return `Affichage de ${from} à ${to} sur ${total} résultats`;
}
