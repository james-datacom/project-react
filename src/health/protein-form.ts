import {
  type ActivityLevel,
  type Goal,
  type Sex,
  type WeightUnit,
} from './protein-config.ts'
import { type ProteinInput } from './protein.ts'

export const proteinDisclaimer =
  'This is an estimate only. Consult a healthcare professional for personalized advice.'

export type ProteinForm = {
  weight: string
  unit: WeightUnit
  age: string
  sex: '' | Sex
  activity: '' | ActivityLevel
  goal: '' | Goal
}

export const initialProteinForm: ProteinForm = {
  weight: '',
  unit: 'kg',
  age: '',
  sex: '',
  activity: '',
  goal: '',
}

export function proteinFieldErrors(form: ProteinForm) {
  const weight = Number(form.weight)
  const age = Number(form.age)

  return {
    weight:
      form.weight.trim() === '' || !Number.isFinite(weight) || weight <= 0
        ? 'Enter a body weight greater than 0.'
        : '',
    age:
      !/^\d+$/.test(form.age.trim()) || age < 18 || age > 100
        ? 'Enter an age from 18 to 100.'
        : '',
    sex: form.sex === '' ? 'Select a sex.' : '',
    activity: form.activity === '' ? 'Select an activity level.' : '',
    goal: form.goal === '' ? 'Select a goal.' : '',
  }
}

export function toProteinInput(form: ProteinForm): ProteinInput | null {
  const errors = proteinFieldErrors(form)
  if (Object.values(errors).some(Boolean)) return null
  if (form.sex === '' || form.activity === '' || form.goal === '') return null

  return {
    weight: Number(form.weight),
    unit: form.unit,
    age: Number(form.age),
    sex: form.sex,
    activity: form.activity,
    goal: form.goal,
  }
}

export function formatMealGrams(grams: number) {
  return grams.toFixed(1)
}
