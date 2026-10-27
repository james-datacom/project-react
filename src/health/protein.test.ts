import { describe, expect, it } from 'vitest'
import {
  activityBases,
  activityOptions,
  goalAdjustments,
  goalOptions,
  poundsToKilograms,
  proteinCapGPerKg,
  sexOptions,
  type ActivityLevel,
  type Goal,
  type Sex,
} from './protein-config.ts'
import {
  calculateProtein,
  clampProteinMultiplier,
  type ProteinInput,
} from './protein.ts'

const activities = Object.keys(activityBases) as ActivityLevel[]
const goals = Object.keys(goalAdjustments) as Goal[]

function input(overrides: Partial<ProteinInput> = {}): ProteinInput {
  return {
    weight: 80,
    unit: 'kg',
    age: 30,
    sex: 'male',
    activity: 'moderate',
    goal: 'maintain',
    ...overrides,
  }
}

describe('protein config', () => {
  it('exports the pound factor, cap, activity bases, and goal adjustments', () => {
    expect(poundsToKilograms).toBe(0.453592)
    expect(proteinCapGPerKg).toBe(2.2)
    expect(activityBases).toEqual({
      sedentary: 0.8,
      light: 1.0,
      moderate: 1.3,
      very: 1.6,
      athlete: 1.8,
    })
    expect(goalAdjustments).toEqual({
      maintain: 0,
      lose: 0.3,
      build: 0.4,
    })
    expect(activityOptions.map((option) => option.label)).toEqual([
      'Sedentary',
      'Lightly Active',
      'Moderately Active',
      'Very Active',
      'Athlete',
    ])
    expect(goalOptions.map((option) => option.label)).toEqual([
      'Maintain Weight',
      'Lose Fat',
      'Build Muscle',
    ])
    expect(sexOptions.map((option) => option.label)).toEqual(['Male', 'Female'])
  })
})

describe('calculateProtein', () => {
  it('uses each activity base when the goal adds nothing', () => {
    for (const activity of activities) {
      const result = calculateProtein(
        input({ weight: 10, activity, goal: 'maintain' }),
      )
      expect(result.multiplier).toBe(activityBases[activity])
      expect(result.dailyGrams).toBe(Math.round(10 * activityBases[activity]))
    }
  })

  it('adds each goal adjustment to the sedentary base', () => {
    for (const goal of goals) {
      const result = calculateProtein(
        input({ weight: 10, activity: 'sedentary', goal }),
      )
      const expected = Math.round((0.8 + goalAdjustments[goal]) * 10) / 10
      expect(result.multiplier).toBe(expected)
      expect(result.dailyGrams).toBe(Math.round(10 * expected))
    }
  })

  it('calculates 80 kg, moderately active, maintain as 104 g at 1.3', () => {
    const result = calculateProtein(input())
    expect(result.multiplier).toBe(1.3)
    expect(result.dailyGrams).toBe(104)
    expect(result.perMeal3).toBeCloseTo(104 / 3)
    expect(result.perMeal4).toBe(26)
  })

  it('converts 200 lb before multiplying', () => {
    const result = calculateProtein(
      input({
        weight: 200,
        unit: 'lb',
        age: 40,
        sex: 'female',
        activity: 'sedentary',
        goal: 'maintain',
      }),
    )
    expect(result.multiplier).toBe(0.8)
    expect(result.dailyGrams).toBe(Math.round(200 * poundsToKilograms * 0.8))
    expect(result.dailyGrams).toBe(73)
  })

  it('calculates 70 kg athlete build muscle as 154 g at 2.2', () => {
    const result = calculateProtein(
      input({
        weight: 70,
        age: 25,
        sex: 'female',
        activity: 'athlete',
        goal: 'build',
      }),
    )
    expect(result.multiplier).toBe(2.2)
    expect(result.dailyGrams).toBe(154)
  })

  it('caps a multiplier above 2.2', () => {
    expect(clampProteinMultiplier(2.3)).toBe(2.2)
    expect(clampProteinMultiplier(2.2)).toBe(2.2)
    expect(clampProteinMultiplier(1.3)).toBe(1.3)
  })

  it('rounds a half up', () => {
    const result = calculateProtein(
      input({ weight: 1.875, activity: 'sedentary', goal: 'maintain' }),
    )
    expect(1.875 * 0.8).toBe(1.5)
    expect(result.dailyGrams).toBe(2)
  })

  it('ignores age and sex', () => {
    const sexes: Sex[] = ['male', 'female']
    const first = calculateProtein(input({ age: 18, sex: sexes[0] }))
    const second = calculateProtein(input({ age: 100, sex: sexes[1] }))
    expect(second.dailyGrams).toBe(first.dailyGrams)
    expect(second.multiplier).toBe(first.multiplier)
  })
})
