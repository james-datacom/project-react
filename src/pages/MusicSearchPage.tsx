import { Check, Construction, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMusic } from '../music/MusicProvider.tsx'
import {
  loadRecents,
  markAdded,
  mergeRecents,
  removeRecent,
  saveRecents,
  type RecentItem,
} from '../music/search-history.ts'
import type { LibraryStorage } from '../music/storage.ts'
import {
  fetchYouTubeSearch,
  isCurrentSearch,
  shouldSearch,
  type SearchHit,
  type SearchOutcome,
} from '../music/youtube-search.ts'

function browserStorage(): LibraryStorage {
  return localStorage
}

function defaultSearch(query: string): Promise<SearchOutcome> {
  return fetchYouTubeSearch(query, import.meta.env.VITE_YOUTUBE_API_KEY ?? '')
}

const searchUnderConstruction = true

function lineFor(item: SearchHit) {
  if (item.kind === 'song') return `Song • ${item.artist}`
  if (item.kind === 'artist') return 'Artist'
  return 'Playlist'
}

export function MusicSearchPage({
  search = defaultSearch,
  recentsStorage,
}: {
  search?: (query: string) => Promise<SearchOutcome>
  recentsStorage?: LibraryStorage
} = {}) {
  const music = useMusic()
  const storage = recentsStorage ?? browserStorage()
  const storageRef = useRef(storage)
  const [query, setQuery] = useState('')
  const queryRef = useRef(query)
  const [recents, setRecents] = useState<RecentItem[]>(() => loadRecents(storage))
  const [matches, setMatches] = useState<SearchHit[]>([])
  const [notice, setNotice] = useState<'empty' | 'error' | null>(null)
  storageRef.current = storage
  queryRef.current = query

  useEffect(() => {
    if (!shouldSearch(query)) return
    const requested = query.trim()
    const timer = window.setTimeout(() => {
      void search(requested).then((outcome) => {
        if (!isCurrentSearch(requested, queryRef.current)) return
        if (!outcome.ok) {
          setMatches([])
          setNotice('error')
          return
        }
        if (outcome.items.length === 0) {
          setMatches([])
          setNotice('empty')
          return
        }
        setNotice(null)
        setMatches(outcome.items)
        setRecents((current) => {
          const next = mergeRecents(current, outcome.items)
          saveRecents(storageRef.current, next)
          return next
        })
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query, search])

  const showingRecents = !shouldSearch(query)
  const rows = showingRecents ? recents : matches

  function libraryHas(videoId: string) {
    return music.library.playlists.some((playlist) => playlist.tracks.some((track) => track.videoId === videoId))
  }

  function added(item: RecentItem) {
    if (item.kind === 'song') return libraryHas(item.id)
    return recents.some((recent) => recent.kind === item.kind && recent.id === item.id && recent.added)
  }

  function add(item: RecentItem) {
    if (item.kind === 'song') {
      music.saveSearchedSong(item.id, item.title)
      return
    }
    setRecents((current) => {
      const next = markAdded(current, item.kind, item.id)
      saveRecents(storageRef.current, next)
      return next
    })
  }

  function remove(item: RecentItem) {
    setRecents((current) => {
      const next = removeRecent(current, item.kind, item.id)
      saveRecents(storageRef.current, next)
      return next
    })
  }

  return (
    <section aria-label="Search" className="search-screen">
      <div className="search-bar">
        <input
          value={query}
          placeholder="What do you want to listen to?"
          aria-label="What do you want to listen to?"
          disabled={searchUnderConstruction}
          onChange={(event) => {
            setNotice(null)
            setQuery(event.target.value)
          }}
        />
        <button type="button" className="search-cancel" onClick={() => setQuery('')}>
          Cancel
        </button>
      </div>
      {searchUnderConstruction ? (
        <div className="search-construction">
          <Construction className="search-construction-icon" aria-hidden="true" />
          <p>This page is under construction</p>
        </div>
      ) : null}
      {searchUnderConstruction || !showingRecents ? null : <h2 className="search-heading">Recent searches</h2>}
      {searchUnderConstruction || showingRecents ? null : notice === 'empty' ? (
        <p className="search-note">Nothing matched.</p>
      ) : null}
      {searchUnderConstruction || showingRecents ? null : notice === 'error' ? (
        <p className="search-error" role="alert">
          Search is unavailable.
        </p>
      ) : null}
      <div className="search-rows">
        {searchUnderConstruction
          ? null
          : rows.map((item) => {
          const saved = added(item)
          return (
            <div className="search-row" key={`${item.kind}:${item.id}`}>
              <img
                className={item.kind === 'artist' ? 'search-art is-round' : 'search-art'}
                src={item.artworkUrl}
                alt=""
              />
              <div className="search-copy">
                <span className="search-title">{item.title}</span>
                <span className="search-meta">{lineFor(item)}</span>
              </div>
              {saved ? (
                <span className="search-added" aria-label={`Added ${item.title}`}>
                  <Check className="player-icon" aria-hidden="true" />
                </span>
              ) : (
                <button type="button" className="icon-button" aria-label={`Add ${item.title}`} onClick={() => add(item)}>
                  <Plus className="player-icon" aria-hidden="true" />
                </button>
              )}
              {showingRecents ? (
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove ${item.title}`}
                  onClick={() => remove(item)}
                >
                  <X className="player-icon" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
