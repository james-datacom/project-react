import { account } from '../content/placeholders.ts'
import { ProfileAvatar } from '../shell/ProfileAvatar.tsx'

export function AccountPage() {
  return (
    <section className="panel">
      <ProfileAvatar imageUrl={account.imageUrl} name={account.name} />
      <p className="account-name">{account.name}</p>
      <p className="account-email">{account.email}</p>
    </section>
  )
}
