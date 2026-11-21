export function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '');
  d = d.split('/')[0].split('?')[0].split('#')[0].split(':')[0];
  d = d.replace(/\.$/, '');
  return d;
}

export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) return false;
  if (domain === 'localhost') return false;
  if (domain.startsWith('chrome') || domain.startsWith('about:')) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  for (const label of labels) {
    if (!label || label.length > 63) return false;
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(label)) return false;
  }
  return true;
}

export function isDuplicate(domain: string, list: string[]): boolean {
  const n = normalizeDomain(domain);
  return list.some(d => normalizeDomain(d) === n);
}
