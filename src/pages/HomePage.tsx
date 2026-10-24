import { product } from '../content/placeholders.ts'

export function HomePage() {
  return (
    <section className="panel">
      <h2 className="panel-title">Welcome</h2>
      <p className="panel-copy">{product.description}</p>
    </section>
  )
}
