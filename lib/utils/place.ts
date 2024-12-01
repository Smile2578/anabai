export function getPriceRangeSymbol(priceLevel?: number): string {
  if (!priceLevel) return '';
  return '¥'.repeat(priceLevel);
}

export function getDisplayName(place: { name: { fr?: string; ja?: string }; originalData?: { title?: string } }): string {
  if (place.name.fr) return place.name.fr;
  if (place.name.ja) return place.name.ja;
  return place.originalData?.title || 'Sans nom';
}

export function formatOpeningHours(weekdayTexts: Record<string, string>): string[] {
  if (!weekdayTexts) return [];
  if (weekdayTexts.fr) return weekdayTexts.fr.split('\n');
  if (weekdayTexts.ja) return weekdayTexts.ja.split('\n');
  return [];
} 