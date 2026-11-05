import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useMusic } from './MusicProvider.tsx'

function PlaylistDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const handleCancel = (event: Event) => {
      event.preventDefault()
      onCloseRef.current()
    }
    dialog.addEventListener('cancel', handleCancel)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      if (dialog.open) dialog.close()
    }
  }, [])
  return (
    <dialog ref={ref} className="music-dialog">
      {children}
    </dialog>
  )
}

export function CreatePlaylistDialog({ onClose }: { onClose: () => void }) {
  const music = useMusic()
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')

  function submitPlaylist(event: FormEvent) {
    event.preventDefault()
    const error = music.createPlaylist(name)
    if (error) {
      setFormError(error)
      return
    }
    onClose()
  }

  return (
    <PlaylistDialog onClose={onClose}>
      <form onSubmit={submitPlaylist}>
        <h2 className="panel-title">New playlist</h2>
        <label className="calculator-field">
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        {formError ? (
          <p className="calculator-error" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="calculator-actions">
          <button type="submit" className="calculator-submit">
            Save
          </button>
          <button type="button" className="calculator-reset" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </PlaylistDialog>
  )
}
