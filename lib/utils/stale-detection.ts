export type DefaultPage = 'resumen' | 'relacion' | 'cuenta';

export function getDefaultPageRoute(page: DefaultPage): string {
  switch (page) {
    case 'resumen':
      return '/dashboard/resumen';
    case 'relacion':
      return '/dashboard/relacion';
    case 'cuenta':
      return '/dashboard/cuenta';
  }
}

export function getMonthsAffectedByEdit(
  editedMonthKey: string,
  allAnalysisMonthKeys: string[]
): string[] {
  return allAnalysisMonthKeys
    .filter((key) => key > editedMonthKey)
    .sort((a, b) => a.localeCompare(b));
}
