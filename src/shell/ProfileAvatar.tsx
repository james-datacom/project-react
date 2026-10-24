import { initials } from '../content/placeholders.ts'

type ProfileAvatarProps = {
  imageUrl: string | null
  name: string
}

export function ProfileAvatar({ imageUrl, name }: ProfileAvatarProps) {
  return (
    <span className="avatar">
      {imageUrl ? (
        <img src={imageUrl} alt="" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  )
}
