import { ChevronLeft, Download, EllipsisVertical, Pencil, Play, Plus, Search, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CreatePlaylistDialog } from '../music/CreatePlaylistDialog.tsx'
import { PlaylistCover } from '../music/PlaylistCover.tsx'
import { SongCover } from '../music/SongCover.tsx'
import type { Library, Playlist } from '../music/library.ts'
import { NowPlaying } from '../music/NowPlaying.tsx'
import { fetchYouTubeTitle } from '../music/oembed.ts'
import { useMusic } from '../music/MusicProvider.tsx'
import { musicPath, playlistPath } from '../music/paths.ts'
import { linkToFetch, titleForSave, titleFromLookup } from '../music/song-title.ts'
import { playlistFile } from '../music/transfer.ts'
import { parseYouTubeVideoUrl } from '../music/youtube-link.ts'
import { useNarrow } from '../shell/useNarrow.ts'

type DialogKind = 'create' | 'edit' | 'delete' | 'add' | null

function playlistMatches(playlist: Playlist, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  if (playlist.name.toLowerCase().includes(needle)) return true
  return playlist.tracks.some((track) => track.title.toLowerCase().includes(needle))
}

export function MusicPage() {
  const { playlistId } = useParams()
  return playlistId ? <PlaylistSongs playlistId={playlistId} /> : <PlaylistLibrary />
}

function downloadLibrary(library: Library) {
  const file = playlistFile(library)
  const blob = new Blob([file.body], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function PlaylistLibrary() {
  const music = useMusic()
  const [dialog, setDialog] = useState<DialogKind>(null)
  const [importError, setImportError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const visiblePlaylists = music.library.playlists.filter((playlist) => playlistMatches(playlist, query))
  const narrow = useNarrow()

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  function toggleSearch() {
    setSearchOpen((open) => {
      if (open) setQuery('')
      return !open
    })
  }

  useEffect(() => {
    if (!menuOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function openCreate() {
    setDialog('create')
  }

  function closeDialog() {
    setDialog(null)
  }

  function savePlaylists() {
    downloadLibrary(music.library)
    setMenuOpen(false)
  }

  async function importFile(file: File | undefined) {
    if (!file) {
      setImportError('Choose a playlist file.')
      return
    }
    const error = music.importLibrary(await file.text())
    if (error) {
      setImportError(error)
      return
    }
    setImportError('')
    setMenuOpen(false)
  }

  return (
    <div className="music-layout">
      <section className="panel music-library" aria-label="Playlists">
        <div className="music-library-bar">
          <div className="music-library-actions">
            <button
              type="button"
              className={searchOpen ? 'icon-button is-on' : 'icon-button'}
              aria-label="Search music"
              aria-expanded={searchOpen}
              aria-controls="music-search"
              onClick={toggleSearch}
            >
              <Search className="player-icon" aria-hidden="true" />
            </button>
            <button type="button" className="icon-button" aria-label="Add playlist" onClick={openCreate}>
              <Plus className="player-icon" aria-hidden="true" />
            </button>
            <div className="playlist-menu">
              <button
                type="button"
                className="icon-button"
                aria-label="Playlist actions"
                aria-expanded={menuOpen}
                aria-controls="playlist-actions"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <EllipsisVertical className="player-icon" aria-hidden="true" />
              </button>
              <div id="playlist-actions" className="playlist-menu-list" role="menu" hidden={!menuOpen}>
                <button type="button" role="menuitem" onClick={savePlaylists}>
                  <Download className="player-icon" aria-hidden="true" />
                  Export Playlist
                </button>
                <button type="button" role="menuitem" onClick={() => fileRef.current?.click()}>
                  <Upload className="player-icon" aria-hidden="true" />
                  Import Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            void importFile(file)
          }}
        />
        {importError ? (
          <p className="calculator-error" role="alert">
            {importError}
          </p>
        ) : null}
        {searchOpen ? (
          <label className="music-search">
            <span className="visually-hidden">Search music</span>
            <input
              id="music-search"
              ref={searchRef}
              value={query}
              placeholder="Search music"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        ) : null}
        {music.library.playlists.length === 0 ? (
          <p className="panel-copy">No playlists yet.</p>
        ) : visiblePlaylists.length === 0 ? (
          <p className="panel-copy">No matching music.</p>
        ) : (
          <ul className="music-list">
            {visiblePlaylists.map((playlist) => (
              <li key={playlist.id}>
                <Link to={playlistPath(playlist.id)} className="music-playlist">
                  <PlaylistCover name={playlist.name} tracks={playlist.tracks} />
                  <span className="music-playlist-name">{playlist.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <PlayerColumn narrow={narrow} />
      {dialog === 'create' ? <CreatePlaylistDialog onClose={closeDialog} /> : null}
    </div>
  )
}

function PlaylistSongs({ playlistId }: { playlistId: string }) {
  const music = useMusic()
  const navigate = useNavigate()
  const playlist = music.library.playlists.find((item) => item.id === playlistId) ?? null
  const [dialog, setDialog] = useState<DialogKind>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [formError, setFormError] = useState('')
  const lookupRef = useRef(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const narrow = useNarrow()

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  if (playlist && music.selectedId !== playlist.id) music.selectPlaylist(playlist.id)

  function toggleSearch() {
    setSearchOpen((open) => {
      if (open) setQuery('')
      return !open
    })
  }

  function closeDialog() {
    setDialog(null)
    setFormError('')
  }

  function openEdit() {
    if (!playlist) return
    setName(playlist.name)
    setFormError('')
    setDialog('edit')
  }

  function openAdd() {
    setUrl('')
    setTitle('')
    setFormError('')
    setDialog('add')
  }

  function submitPlaylist(event: FormEvent) {
    event.preventDefault()
    if (!playlist) return
    const error = music.updatePlaylist(playlist.id, name)
    if (error) {
      setFormError(error)
      return
    }
    closeDialog()
  }

  async function onLinkChange(value: string) {
    setUrl(value)
    const request = ++lookupRef.current
    const fetchUrl = linkToFetch(value)
    if (!fetchUrl) return
    const fetched = await fetchYouTubeTitle(fetchUrl)
    const applied = titleFromLookup(lookupRef.current, request, fetched)
    if (!applied.apply) return
    setTitle(applied.title)
    if (!applied.title) setFormError('Enter a title. The video title could not be loaded.')
  }

  function submitSong(event: FormEvent) {
    event.preventDefault()
    if (!playlist) return
    const parsed = parseYouTubeVideoUrl(url)
    if (!parsed.ok) {
      setFormError(parsed.error)
      return
    }
    const nextTitle = titleForSave(title)
    if (!nextTitle) {
      setFormError('Enter a title.')
      return
    }
    const error = music.addTrack(playlist.id, {
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

  const needle = query.trim().toLowerCase()
  const visibleTracks = playlist?.tracks.filter((track) => track.title.toLowerCase().includes(needle)) ?? []

  return (
    <div className="music-layout">
      <section className="panel music-library" aria-label="Tracks">
        <div className="music-library-bar">
          <Link to={musicPath} className="icon-button" aria-label="Back">
            <ChevronLeft className="player-icon" aria-hidden="true" />
          </Link>
          <div className="music-library-actions">
            <button
              type="button"
              className={searchOpen ? 'icon-button is-on' : 'icon-button'}
              aria-label="Search music"
              aria-expanded={searchOpen}
              aria-controls="playlist-search"
              onClick={toggleSearch}
            >
              <Search className="player-icon" aria-hidden="true" />
            </button>
            <button type="button" className="icon-button" aria-label="Add song" onClick={openAdd} disabled={!playlist}>
              <Plus className="player-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
        {searchOpen ? (
          <label className="music-search">
            <span className="visually-hidden">Search music</span>
            <input
              id="playlist-search"
              ref={searchRef}
              value={query}
              placeholder="Search music"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        ) : null}
        {playlist ? (
          <>
            <div className="music-heading">
              <div>
                <h2 className="panel-title">{playlist.name}</h2>
              </div>
              <div className="music-library-actions">
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Play"
                  disabled={playlist.tracks.length === 0}
                  onClick={() => music.playPlaylist(playlist.id)}
                >
                  <Play className="player-icon" />
                </button>
                <button type="button" className="icon-button" aria-label="Edit" onClick={openEdit}>
                  <Pencil className="player-icon" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Delete"
                  onClick={() => {
                    setFormError('')
                    setDialog('delete')
                  }}
                >
                  <Trash2 className="player-icon" />
                </button>
              </div>
            </div>
            {playlist.tracks.length === 0 ? (
              <p className="panel-copy">This playlist has no songs.</p>
            ) : visibleTracks.length === 0 ? (
              <p className="panel-copy">No matching music.</p>
            ) : (
              <ul className="music-list">
                {visibleTracks.map((track) => (
                  <li key={track.id} className="music-track">
                    <button type="button" className="music-playlist" onClick={() => music.playTrack(playlist.id, track.id)}>
                      <SongCover videoId={track.videoId} title={track.title} className="cover-tile music-playlist-avatar" />
                      <span className="music-playlist-name">{track.title}</span>
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Remove"
                      onClick={() => music.removeTrack(playlist.id, track.id)}
                    >
                      <X className="player-icon" aria-hidden="true" />
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
          <p className="panel-copy">This playlist is not available.</p>
        )}
      </section>
      <PlayerColumn narrow={narrow} />
      {dialog ? (
        <MusicDialog onClose={closeDialog}>
          {dialog === 'delete' ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (playlist) music.deletePlaylist(playlist.id)
                closeDialog()
                navigate(musicPath)
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
          {dialog === 'edit' ? (
            <form onSubmit={submitPlaylist}>
              <h2 className="panel-title">Edit playlist</h2>
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
                <input value={url} onChange={(event) => void onLinkChange(event.target.value)} />
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
                <button type="submit" className="calculator-submit">
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

function PlayerColumn({ narrow }: { narrow: boolean }) {
  const music = useMusic()
  if (narrow) return null
  return (
    <section id="now-playing-column" className="panel music-player-region" tabIndex={-1} aria-label="Player">
      {music.session ? <NowPlaying presentation="column" /> : <p className="panel-copy">Nothing playing</p>}
    </section>
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
