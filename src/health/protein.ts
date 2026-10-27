import {
  activityBases,
  goalAdjustments,
  poundsToKilograms,
  proteinCapGPerKg,
  type ActivityLevel,
  type Goal,
  type Sex,
  type WeightUnit,
} from './protein-config.ts'

export type ProteinInput = {
  weight: number
  unit: WeightUnit
  age: number
  sex: Sex
  activity: ActivityLevel
  goal: Goal
}

export type ProteinResult = {
  dailyGrams: number
  multiplier: number
  perMeal3: number
  perMeal4: number
}

export function clampProteinMultiplier(value: number) {
  return Math.min(proteinCapGPerKg, value)
}

export function calculateProtein(input: ProteinInput): ProteinResult {
  void input.age
  void input.sex

  const weightKg =
    input.unit === 'lb' ? input.weight * poundsToKilograms : input.weight
  const combined = activityBases[input.activity] + goalAdjustments[input.goal]
  const multiplier = clampProteinMultiplier(Math.round(combined * 10) / 10)
  const dailyGrams = Math.round(weightKg * multiplier)

  return {
    dailyGrams,
    multiplier,
    perMeal3: dailyGrams / 3,
    perMeal4: dailyGrams / 4,
  }
}
