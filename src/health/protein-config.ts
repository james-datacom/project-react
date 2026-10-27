export const poundsToKilograms = 0.453592

export const proteinCapGPerKg = 2.2

export const activityBases = {
  sedentary: 0.8,
  light: 1.0,
  moderate: 1.3,
  very: 1.6,
  athlete: 1.8,
} as const

export const goalAdjustments = {
  maintain: 0,
  lose: 0.3,
  build: 0.4,
} as const

export type ActivityLevel = keyof typeof activityBases
export type Goal = keyof typeof goalAdjustments
export type WeightUnit = 'kg' | 'lb'
export type Sex = 'male' | 'female'

export const activityOptions = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Lightly Active' },
  { value: 'moderate', label: 'Moderately Active' },
  { value: 'very', label: 'Very Active' },
  { value: 'athlete', label: 'Athlete' },
] as const satisfies ReadonlyArray<{ value: ActivityLevel; label: string }>

export const goalOptions = [
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'lose', label: 'Lose Fat' },
  { value: 'build', label: 'Build Muscle' },
] as const satisfies ReadonlyArray<{ value: Goal; label: string }>

export const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const satisfies ReadonlyArray<{ value: Sex; label: string }>
