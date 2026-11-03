import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { fetchYouTubeTitle } from '../music/oembed.ts'
import { useMusic } from '../music/MusicProvider.tsx'
import { parseYouTubeVideoUrl } from '../music/youtube-link.ts'

type DialogKind = 'create' | 'edit' | 'delete' | 'add' | null

export function MusicPage() {
  const music = useMusic()
  const [dialog, setDialog] = useState<DialogKind>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const selected = music.library.playlists.find((playlist) => playlist.id === music.selectedId) ?? null

  function openCreate() {
    setName('')
    setDescription('')
    setFormError('')
    setDialog('create')
  }

  function openEdit() {
    if (!selected) return
    setName(selected.name)
    setDescription(selected.description)
    setFormError('')
    setDialog('edit')
  }

  function openAdd() {
    setUrl('')
    setTitle('')
    setFormError('')
    setDialog('add')
  }

  function closeDialog() {
    setDialog(null)
    setFormError('')
    setSaving(false)
  }

  function submitPlaylist(event: FormEvent) {
    event.preventDefault()
    const error =
      dialog === 'edit' && selected
        ? music.updatePlaylist(selected.id, name, description)
        : music.createPlaylist(name, description)
    if (error) {
      setFormError(error)
      return
    }
    closeDialog()
  }

  async function submitSong(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    const parsed = parseYouTubeVideoUrl(url)
    if (!parsed.ok) {
      setFormError(parsed.error)
      return
    }
    let nextTitle = title.trim()
    if (!nextTitle) {
      setSaving(true)
      const fetched = await fetchYouTubeTitle(url.trim())
      setSaving(false)
      if (!fetched) {
        setFormError('Enter a title. The video title could not be loaded.')
        return
      }
      nextTitle = fetched
    }
    const error = music.addTrack(selected.id, {
      youtubeUrl: url.trim(),
      videoId: parsed.videoId,
      title: nextTitle,
    })
    if (error) {
      setFormError(error)
      return
    }
    closeDialog()
  }

  return (
    <div className="music-layout">
      <section className="panel music-library" aria-label="Playlists">
        <div className="music-toolbar">
          <h2 className="panel-title">Playlists</h2>
          <button type="button" className="calculator-submit" onClick={openCreate}>
            New playlist
          </button>
        </div>
        {music.library.playlists.length === 0 ? (
          <p className="panel-copy">No playlists yet.</p>
        ) : (
          <ul className="music-list">
            {music.library.playlists.map((playlist) => (
              <li key={playlist.id}>
                <button
                  type="button"
                  className="music-playlist"
                  aria-current={playlist.id === selected?.id ? 'true' : undefined}
                  onClick={() => music.selectPlaylist(playlist.id)}
                >
                  {playlist.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="panel music-tracks" aria-label="Tracks">
        {selected ? (
          <>
            <div className="music-toolbar">
              <div>
                <h2 className="panel-title">{selected.name}</h2>
                <p className="panel-copy">{selected.description}</p>
              </div>
              <div className="calculator-actions">
                <button
                  type="button"
                  className="calculator-submit"
                  disabled={selected.tracks.length === 0}
                  onClick={() => music.playPlaylist(selected.id)}
                >
                  Play
                </button>
                <button type="button" className="calculator-reset" onClick={openEdit}>
                  Edit
                </button>
                <button
                  type="button"
                  className="calculator-reset"
                  onClick={() => {
                    setFormError('')
                    setDialog('delete')
                  }}
                >
                  Delete
                </button>
                <button type="button" className="calculator-reset" onClick={openAdd}>
                  Add song
                </button>
              </div>
            </div>
            {selected.tracks.length === 0 ? (
              <p className="panel-copy">This playlist has no songs.</p>
            ) : (
              <ul className="music-list">
                {selected.tracks.map((track) => (
                  <li key={track.id} className="music-track">
                    <button type="button" onClick={() => music.playTrack(selected.id, track.id)}>
                      {track.title}
                    </button>
                    <button type="button" onClick={() => music.removeTrack(selected.id, track.id)}>
                      Remove
                    </button>
                    {music.unavailableIds.includes(track.id) ? (
                      <p className="calculator-error" role="alert">
                        This video is unavailable.
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="panel-copy">Select a playlist.</p>
        )}
      </section>
      {dialog ? (
        <MusicDialog onClose={closeDialog}>
          {dialog === 'delete' ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (selected) music.deletePlaylist(selected.id)
                closeDialog()
              }}
            >
              <h2 className="panel-title">Delete playlist</h2>
              <p className="panel-copy">Delete this playlist and its songs?</p>
              <div className="calculator-actions">
                <button type="submit" className="calculator-submit">
                  Confirm
                </button>
                <button type="button" className="calculator-reset" onClick={closeDialog}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
          {dialog === 'create' || dialog === 'edit' ? (
            <form onSubmit={submitPlaylist}>
              <h2 className="panel-title">{dialog === 'edit' ? 'Edit playlist' : 'New playlist'}</h2>
              <label className="calculator-field">
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="calculator-field">
                Description
                <input value={description} onChange={(event) => setDescription(event.target.value)} />
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
                <button type="button" className="calculator-reset" onClick={closeDialog}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
          {dialog === 'add' ? (
            <form onSubmit={submitSong}>
              <h2 className="panel-title">Add song</h2>
              <label className="calculator-field">
                YouTube link
                <input value={url} onChange={(event) => setUrl(event.target.value)} />
              </label>
              <label className="calculator-field">
                Title
                <input value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>
              {formError ? (
                <p className="calculator-error" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="calculator-actions">
                <button type="submit" className="calculator-submit" disabled={saving}>
                  Save
                </button>
                <button type="button" className="calculator-reset" onClick={closeDialog}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </MusicDialog>
      ) : null}
    </div>
  )
}

function MusicDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleCancel = (event: Event) => {
      event.preventDefault()
      onCloseRef.current()
    }
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [])
  return (
    <dialog ref={ref} className="music-dialog" open>
      {children}
    </dialog>
  )
}
