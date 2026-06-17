/**
 * Normalizes weather preset fields according to the following rules:
 * 1. New weatherPresets (array) overrides old weatherPreset (string) if both appear.
 * 2. If both are undefined, null, or empty, fallback to ["normal"].
 * 3. If the array contains "normal" along with other conditions, remove "normal".
 * 4. Deduplicate values.
 */
export function normalizeWeatherPresets(
  presets?: string[] | null,
  preset?: string | null
): ('normal' | 'rain' | 'hot' | 'night')[] {
  let result: string[] = [];

  if (presets !== undefined && presets !== null) {
    result = presets;
  } else if (preset !== undefined && preset !== null) {
    result = [preset];
  }

  // Deduplicate
  result = Array.from(new Set(result));

  // Filter to keep only valid values (in case non-enum values slip through non-Zod checks)
  const validValues = ['normal', 'rain', 'hot', 'night'];
  result = result.filter(v => validValues.includes(v));

  // Fallback to ["normal"] if empty
  if (result.length === 0) {
    return ['normal'];
  }

  // If there are other conditions alongside "normal", remove "normal"
  if (result.length > 1 && result.includes('normal')) {
    result = result.filter(v => v !== 'normal');
  }

  return result as ('normal' | 'rain' | 'hot' | 'night')[];
}
