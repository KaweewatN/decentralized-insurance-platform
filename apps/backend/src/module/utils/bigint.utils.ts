// utils/bigint.utils.ts

export function toNumberSafe(value: bigint): number {
  // Convert to string first, then to number to avoid overflow
  const num = parseFloat(value.toString());
  if (!Number.isSafeInteger(num)) {
    throw new Error(`Value ${value} exceeds safe integer range for JavaScript`);
  }
  return num;
}
