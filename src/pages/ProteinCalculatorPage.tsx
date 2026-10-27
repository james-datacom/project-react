import { useState, type FormEvent, type ReactNode } from 'react'
import { Calculator } from 'lucide-react'
import {
  activityOptions,
  goalOptions,
  sexOptions,
  type WeightUnit,
} from '../health/protein-config.ts'
import {
  formatMealGrams,
  initialProteinForm,
  proteinDisclaimer,
  proteinFieldErrors,
  toProteinInput,
  type ProteinForm,
} from '../health/protein-form.ts'
import { calculateProtein, type ProteinResult } from '../health/protein.ts'

export function ProteinCalculatorPage() {
  const [form, setForm] = useState(initialProteinForm)
  const [result, setResult] = useState<ProteinResult | null>(null)
  const errors = proteinFieldErrors(form)
  const canCalculate = toProteinInput(form) !== null

  function update<Key extends keyof ProteinForm>(key: Key, value: ProteinForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = toProteinInput(form)
    if (!input) return
    setResult(calculateProtein(input))
  }

  function onReset() {
    setForm(initialProteinForm)
    setResult(null)
  }

  return (
    <section className="panel calculator">
      <h2 className="calculator-title">
        <Calculator className="calculator-icon" aria-hidden="true" />
        Protein Calculator
      </h2>
      <form className="calculator-form" onSubmit={onSubmit} noValidate>
        <Field
          id="body-weight"
          label="Body Weight"
          error={errors.weight}
        >
          <input
            id="body-weight"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={form.weight}
            aria-invalid={errors.weight ? true : undefined}
            aria-describedby={errors.weight ? 'body-weight-error' : undefined}
            onChange={(event) => update('weight', event.target.value)}
          />
        </Field>
        <Field id="weight-unit" label="Weight Unit" error="">
          <select
            id="weight-unit"
            value={form.unit}
            onChange={(event) => update('unit', event.target.value as WeightUnit)}
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </Field>
        <Field id="age" label="Age" error={errors.age}>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            min={18}
            max={100}
            step={1}
            value={form.age}
            aria-invalid={errors.age ? true : undefined}
            aria-describedby={errors.age ? 'age-error' : undefined}
            onChange={(event) => update('age', event.target.value)}
          />
        </Field>
        <Field id="sex" label="Sex" error={errors.sex}>
          <select
            id="sex"
            value={form.sex}
            aria-invalid={errors.sex ? true : undefined}
            aria-describedby={errors.sex ? 'sex-error' : undefined}
            onChange={(event) => update('sex', event.target.value as ProteinForm['sex'])}
          >
            <option value="">Select</option>
            {sexOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="activity-level" label="Activity Level" error={errors.activity}>
          <select
            id="activity-level"
            value={form.activity}
            aria-invalid={errors.activity ? true : undefined}
            aria-describedby={errors.activity ? 'activity-level-error' : undefined}
            onChange={(event) =>
              update('activity', event.target.value as ProteinForm['activity'])
            }
          >
            <option value="">Select</option>
            {activityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="goal" label="Goal" error={errors.goal}>
          <select
            id="goal"
            value={form.goal}
            aria-invalid={errors.goal ? true : undefined}
            aria-describedby={errors.goal ? 'goal-error' : undefined}
            onChange={(event) => update('goal', event.target.value as ProteinForm['goal'])}
          >
            <option value="">Select</option>
            {goalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="calculator-actions">
          <button type="submit" className="calculator-submit" disabled={!canCalculate}>
            Calculate
          </button>
          <button type="button" className="calculator-reset" onClick={onReset}>
            Reset
          </button>
        </div>
      </form>
      {result ? <ProteinResultCard result={result} /> : null}
    </section>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error: string
  children: ReactNode
}) {
  return (
    <div className="calculator-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="calculator-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function ProteinResultCard({ result }: { result: ProteinResult }) {
  return (
    <section className="calculator-result" aria-live="polite">
      <p>{result.dailyGrams} grams per day</p>
      <p>{result.multiplier.toFixed(1)} g/kg</p>
      <p>3 meals: {formatMealGrams(result.perMeal3)}</p>
      <p>4 meals: {formatMealGrams(result.perMeal4)}</p>
      <p className="calculator-disclaimer">{proteinDisclaimer}</p>
    </section>
  )
}
