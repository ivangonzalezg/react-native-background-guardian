import BackgroundGuardian from './NativeBackgroundGuardian';

export function multiply(a: number, b: number): number {
  return BackgroundGuardian.multiply(a, b);
}
