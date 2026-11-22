export function sanitizeCredits(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.floor(num));
}

export function hasNoCredits(credits, isTester = false) {
  if (Boolean(isTester)) return false;
  return sanitizeCredits(credits) < 1;
}

export function syncCreditsFromResult(
  source,
  { setCredits, setIsTester } = {}
) {
  if (!source || typeof source !== 'object') return;

  const rawBalance =
    typeof source.remainingCredits === 'number'
      ? source.remainingCredits
      : typeof source.tokensLeft === 'number'
      ? source.tokensLeft
      : undefined;

  if (typeof rawBalance === 'number' && typeof setCredits === 'function') {
    setCredits(sanitizeCredits(rawBalance));
  }

  if (typeof source.isTester === 'boolean' && typeof setIsTester === 'function') {
    setIsTester(source.isTester);
  }
}