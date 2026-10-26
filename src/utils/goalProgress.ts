/** Use integer cents so truncation never drops an exact percentage point. */
export function getGoalProgress(goal: { valorAtual: number; valorObjetivo: number }): number {
  const savedCents = Math.round(goal.valorAtual * 100);
  const targetCents = Math.round(goal.valorObjetivo * 100);
  if (!Number.isSafeInteger(savedCents) || !Number.isSafeInteger(targetCents) || savedCents <= 0 || targetCents <= 0) return 0;
  if (savedCents >= targetCents) return 100;
  return Number(BigInt(savedCents) * 100n / BigInt(targetCents));
}
