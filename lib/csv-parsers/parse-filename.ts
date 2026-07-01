const FILENAME_PATTERN =
  /^(Miguel|Grecia)-([A-Za-zÁ-ú]+)-(bofa|capitalone|applewallet)/i;

export interface ParsedFilename {
  owner: 'Miguel' | 'Grecia';
  monthHint: string;
  bank: 'bofa' | 'capitalone' | 'applewallet';
}

export function parseFilename(filename: string): ParsedFilename | null {
  const baseName = filename.replace(/\.csv$/i, '');
  const match = baseName.match(FILENAME_PATTERN);
  if (!match) return null;

  return {
    owner: match[1] as 'Miguel' | 'Grecia',
    monthHint: match[2],
    bank: match[3].toLowerCase() as ParsedFilename['bank'],
  };
}

export function bankToSource(
  bank: ParsedFilename['bank']
): 'apple-wallet' | 'capital-one' | 'bank-of-america' {
  switch (bank) {
    case 'applewallet':
      return 'apple-wallet';
    case 'capitalone':
      return 'capital-one';
    case 'bofa':
      return 'bank-of-america';
  }
}
