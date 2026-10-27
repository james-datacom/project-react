import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  initialProteinForm,
  proteinDisclaimer,
  proteinFieldErrors,
  toProteinInput,
} from '../health/protein-form.ts'
import { calculateProtein } from '../health/protein.ts'
import pageSource from './ProteinCalculatorPage.tsx?raw'
import { ProteinCalculatorPage, ProteinResultCard } from './ProteinCalculatorPage.tsx'

describe('ProteinCalculatorPage', () => {
  it('shows kg, field messages, and a disabled Calculate button on first paint', () => {
    const html = renderToStaticMarkup(<ProteinCalculatorPage />)
    const errors = proteinFieldErrors(initialProteinForm)

    expect(html).toContain('Protein Calculator')
    expect(html).toContain('<option value="kg" selected="">kg</option>')
    expect(html).toContain('disabled=""')
    expect(html).not.toContain('calculator-result')
    expect(html).not.toContain(proteinDisclaimer)
    for (const message of Object.values(errors)) {
      expect(html).toContain(message)
    }
    expect(html.match(/aria-invalid="true"/g)).toHaveLength(5)
  })

  it('renders the result card from a client-side calculation and clears back to the empty form', () => {
    const input = toProteinInput({
      ...initialProteinForm,
      weight: '80',
      age: '30',
      sex: 'male',
      activity: 'moderate',
      goal: 'maintain',
    })
    expect(input).not.toBeNull()
    const result = calculateProtein(input!)
    const html = renderToStaticMarkup(<ProteinResultCard result={result} />)

    expect(result.dailyGrams).toBe(104)
    expect(html).toContain('104 grams per day')
    expect(html).toContain('1.3 g/kg')
    expect(html).toContain('3 meals: 34.7')
    expect(html).toContain('4 meals: 26.0')
    expect(html).toContain(proteinDisclaimer)

    expect(pageSource).not.toContain('localStorage')
    expect(pageSource).not.toContain('fetch(')
    expect(pageSource).toContain('setForm(initialProteinForm)')
    expect(pageSource).toContain('setResult(null)')
    expect(pageSource).toContain('setResult(calculateProtein(input))')
  })
})
