export const product = {
  name: 'Project React',
  monogram: 'PR',
  description: 'A shared place for the first layout.',
}

export const account: {
  name: string
  email: string
  imageUrl: string | null
} = {
  name: 'Alex Rivera',
  email: 'alex@example.com',
  imageUrl: null,
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
