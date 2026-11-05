import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  addTrack as addTrackRecord,
  createPlaylist as createPlaylistRecord,
  deletePlaylist as deletePlaylistRecord,
  removeTrack as removeTrackRecord,
  saveSearchedSong as saveSearchedSongRecord,
  updatePlaylist as updatePlaylistRecord,
  type Library,
} from './library.ts'
import {
  cycleRepeat,
  endOfTrack,
  nextTrack,
  orderForShuffle,
  playAtIndex,
  previousTrack,
  skipUnavailable,
  startAtTrack,
  startPlaylist,
  type QueueResult,
  type QueueState,
  type RepeatMode,
} from './queue.ts'
import { loadLibrary, saveLibrary, type LibraryStorage } from './storage.ts'
import { commitImport } from './transfer.ts'
import type { PlayerHandle } from './youtube-player.ts'

export type Session = {
  playlistId: string
  trackIds: string[]
  index: number
  failedIds: string[]
  paused: boolean
}

export type PlaybackCommand = {
  nonce: number
  action: 'load' | 'resume' | 'pause' | 'seek-start'
  videoId: string
}

type MusicContextValue = {
  library: Library
  selectedId: string | null
  session: Session | null
  repeat: RepeatMode
  shuffle: boolean
  volume: number
  muted: boolean
  currentTime: number
  duration: number
  unavailableIds: string[]
  command: PlaybackCommand | null
  nowPlayingOpen: boolean
  queueOpen: boolean
  selectPlaylist: (playlistId: string) => void
  createPlaylist: (name: string) => string | null
  updatePlaylist: (playlistId: string, name: string) => string | null
  importLibrary: (raw: string | null) => string | null
  deletePlaylist: (playlistId: string) => void
  addTrack: (
    playlistId: string,
    track: { youtubeUrl: string; videoId: string; title: string },
  ) => string | null
  saveSearchedSong: (videoId: string, title: string) => void
  removeTrack: (playlistId: string, trackId: string) => void
  playPlaylist: (playlistId: string) => void
  playTrack: (playlistId: string, trackId: string) => void
  playAt: (index: number) => void
  openNowPlaying: () => void
  closeNowPlaying: () => void
  openQueue: () => void
  closeQueue: () => void
  togglePlay: () => void
  pause: () => void
  goNext: () => void
  goPrevious: () => void
  cycleRepeatMode: () => void
  toggleShuffle: () => void
  seek: (seconds: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  registerPlayer: (player: PlayerHandle | null) => void
  reportTime: (current: number, duration: number) => void
  reportEnded: () => void
  reportError: () => void
}

const MusicContext = createContext<MusicContextValue | null>(null)

function browserStorage(): LibraryStorage {
  return localStorage
}

function videoIdAt(library: Library, playlistId: string, trackIds: string[], index: number) {
  const playlist = library.playlists.find((item) => item.id === playlistId)
  const trackId = trackIds[index]
  return playlist?.tracks.find((track) => track.id === trackId)?.videoId ?? ''
}

function toQueue(session: Session): QueueState {
  return {
    trackIds: session.trackIds,
    index: session.index,
    failedIds: session.failedIds,
  }
}

export function MusicProvider({
  children,
  storage,
  initialSession = null,
  initialQueueOpen = false,
}: {
  children: ReactNode
  storage?: LibraryStorage
  initialSession?: Session | null
  initialQueueOpen?: boolean
}) {
  const resolvedStorage = storage ?? browserStorage()
  const storageRef = useRef(resolvedStorage)
  const [library, setLibrary] = useState<Library>(() => loadLibrary(resolvedStorage))
  const [selectedId, setSelectedId] = useState<string | null>(
    () => loadLibrary(resolvedStorage).playlists[0]?.id ?? null,
  )
  const [session, setSession] = useState<Session | null>(initialSession)
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false)
  const [queueOpen, setQueueOpen] = useState(initialQueueOpen)
  const [repeat, setRepeat] = useState<RepeatMode>('off')
  const [shuffle, setShuffle] = useState(false)
  const [volume, setVolumeState] = useState(100)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [unavailableIds, setUnavailableIds] = useState<string[]>([])
  const [command, setCommand] = useState<PlaybackCommand | null>(null)

  const libraryRef = useRef(library)
  const sessionRef = useRef(session)
  const repeatRef = useRef(repeat)
  const shuffleRef = useRef(shuffle)
  const volumeRef = useRef(volume)
  const mutedRef = useRef(muted)
  const selectedRef = useRef(selectedId)
  const playerRef = useRef<PlayerHandle | null>(null)

  useEffect(() => {
    libraryRef.current = library
    sessionRef.current = session
    repeatRef.current = repeat
    shuffleRef.current = shuffle
    volumeRef.current = volume
    mutedRef.current = muted
    selectedRef.current = selectedId
  })

  const issue = useCallback((action: PlaybackCommand['action'], videoId: string) => {
    setCommand((current) => ({
      nonce: (current?.nonce ?? 0) + 1,
      action,
      videoId,
    }))
  }, [])

  const clearPlayback = useCallback(() => {
    setSession(null)
    setNowPlayingOpen(false)
    setQueueOpen(false)
    issue('pause', '')
  }, [issue])

  const commit = useCallback((next: Library) => {
    setLibrary(next)
    libraryRef.current = next
    try {
      saveLibrary(storageRef.current!, next)
    } catch {
      // Keep the in-memory library if the browser refuses to store it.
    }
  }, [])

  const applyResult = useCallback(
    (playlistId: string, result: QueueResult) => {
      const current = sessionRef.current
      if (result.type === 'restart' || result.type === 'replay') {
        const videoId = current
          ? videoIdAt(libraryRef.current, playlistId, current.trackIds, current.index)
          : ''
        setSession((value) => (value ? { ...value, paused: false } : value))
        issue('seek-start', videoId)
        return
      }
      if (result.type === 'stop') {
        setSession((value) => (value ? { ...value, paused: true } : value))
        issue('pause', '')
        return
      }
      const videoId = videoIdAt(
        libraryRef.current,
        playlistId,
        result.queue.trackIds,
        result.queue.index,
      )
      setSession((value) =>
        value
          ? {
              ...value,
              trackIds: result.queue.trackIds,
              index: result.queue.index,
              failedIds: result.queue.failedIds,
              paused: false,
            }
          : value,
      )
      issue('load', videoId)
    },
    [issue],
  )

  const playPlaylist = useCallback(
    (playlistId: string) => {
      const playlist = libraryRef.current.playlists.find((item) => item.id === playlistId)
      if (!playlist || playlist.tracks.length === 0) return
      const started = startPlaylist(
        playlist.tracks.map((track) => track.id),
        { shuffle: shuffleRef.current, random: Math.random },
      )
      if (!started) return
      setSelectedId(playlistId)
      setUnavailableIds([])
      setSession({
        playlistId,
        trackIds: started.trackIds,
        index: started.index,
        failedIds: [],
        paused: false,
      })
      issue('load', videoIdAt(libraryRef.current, playlistId, started.trackIds, started.index))
    },
    [issue],
  )

  const value = useMemo<MusicContextValue>(
    () => ({
      library,
      selectedId,
      session,
      repeat,
      shuffle,
      volume,
      muted,
      currentTime,
      duration,
      unavailableIds,
      command,
      nowPlayingOpen,
      queueOpen,
      selectPlaylist: (playlistId) => setSelectedId(playlistId),
      createPlaylist: (name) => {
        const result = createPlaylistRecord(libraryRef.current, { name }, {
          id: crypto.randomUUID(),
          now: new Date().toISOString(),
        })
        if (!result.ok) return result.error
        commit(result.library)
        setSelectedId(result.library.playlists.at(-1)?.id ?? null)
        return null
      },
      updatePlaylist: (playlistId, name) => {
        const result = updatePlaylistRecord(libraryRef.current, playlistId, { name }, new Date().toISOString())
        if (!result.ok) return result.error
        commit(result.library)
        return null
      },
      importLibrary: (raw) => {
        try {
          const result = commitImport(storageRef.current, libraryRef.current, raw)
          if (!result.ok) return result.error
          setLibrary(result.library)
          libraryRef.current = result.library
          return null
        } catch {
          return 'The playlist file could not be saved.'
        }
      },
      deletePlaylist: (playlistId) => {
        const result = deletePlaylistRecord(libraryRef.current, playlistId)
        if (!result.ok) return
        commit(result.library)
        if (sessionRef.current?.playlistId === playlistId) clearPlayback()
        if (selectedRef.current === playlistId) {
          setSelectedId(result.library.playlists[0]?.id ?? null)
        }
      },
      addTrack: (playlistId, track) => {
        const result = addTrackRecord(
          libraryRef.current,
          playlistId,
          { ...track, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
          new Date().toISOString(),
        )
        if (!result.ok) return result.error
        commit(result.library)
        return null
      },
      saveSearchedSong: (videoId, title) => {
        const next = saveSearchedSongRecord(libraryRef.current, {
          videoId,
          title,
          trackId: crypto.randomUUID(),
          now: new Date().toISOString(),
        })
        if (next === libraryRef.current) return
        commit(next)
      },
      removeTrack: (playlistId, trackId) => {
        const result = removeTrackRecord(
          libraryRef.current,
          playlistId,
          trackId,
          new Date().toISOString(),
        )
        if (!result.ok) return
        commit(result.library)
        const current = sessionRef.current
        if (!current || current.playlistId !== playlistId) return
        const playlist = result.library.playlists.find((item) => item.id === playlistId)
        if (!playlist || playlist.tracks.length === 0) {
          clearPlayback()
          return
        }
        const position = current.trackIds.indexOf(trackId)
        if (position < 0) return
        const trackIds = current.trackIds.filter((id) => id !== trackId)
        if (position !== current.index) {
          setSession({
            ...current,
            trackIds,
            index: position < current.index ? current.index - 1 : current.index,
          })
          return
        }
        if (position < trackIds.length) {
          setSession({ ...current, trackIds, index: position, paused: false })
          issue('load', videoIdAt(result.library, playlistId, trackIds, position))
          return
        }
        const stepped = nextTrack(toQueue(current), repeatRef.current, {
          shuffle: shuffleRef.current,
          random: Math.random,
        })
        if (stepped.type !== 'play') {
          setSession({ ...current, trackIds, index: Math.max(0, trackIds.length - 1), paused: true })
          issue('pause', '')
          return
        }
        const nextIds = stepped.queue.trackIds.filter((id) => id !== trackId)
        const index = Math.min(stepped.queue.index, Math.max(0, nextIds.length - 1))
        setSession({
          ...current,
          trackIds: nextIds,
          index,
          failedIds: stepped.queue.failedIds,
          paused: false,
        })
        issue('load', videoIdAt(result.library, playlistId, nextIds, index))
      },
      playPlaylist,
      playTrack: (playlistId, trackId) => {
        const playlist = libraryRef.current.playlists.find((item) => item.id === playlistId)
        if (!playlist) return
        const started = startAtTrack(
          playlist.tracks.map((track) => track.id),
          trackId,
          { shuffle: shuffleRef.current, random: Math.random },
        )
        if (!started) return
        setSelectedId(playlistId)
        setUnavailableIds([])
        setSession({
          playlistId,
          trackIds: started.trackIds,
          index: started.index,
          failedIds: [],
          paused: false,
        })
        issue('load', videoIdAt(libraryRef.current, playlistId, started.trackIds, started.index))
      },
      playAt: (index) => {
        const current = sessionRef.current
        if (!current) return
        const next = playAtIndex(toQueue(current), index)
        if (!next) return
        setSession({
          ...current,
          trackIds: next.trackIds,
          index: next.index,
          failedIds: next.failedIds,
          paused: false,
        })
        issue('load', videoIdAt(libraryRef.current, current.playlistId, next.trackIds, next.index))
      },
      openNowPlaying: () => setNowPlayingOpen(true),
      closeNowPlaying: () => {
        setNowPlayingOpen(false)
      },
      openQueue: () => {
        if (!sessionRef.current || sessionRef.current.trackIds.length === 0) return
        setQueueOpen(true)
      },
      closeQueue: () => {
        setQueueOpen(false)
      },
      togglePlay: () => {
        const current = sessionRef.current
        if (!current) {
          if (selectedRef.current) playPlaylist(selectedRef.current)
          return
        }
        if (current.paused) {
          setSession({ ...current, paused: false })
          issue('resume', videoIdAt(libraryRef.current, current.playlistId, current.trackIds, current.index))
          return
        }
        setSession({ ...current, paused: true })
        issue('pause', '')
      },
      pause: () => {
        const current = sessionRef.current
        if (!current) return
        setSession({ ...current, paused: true })
        issue('pause', '')
      },
      goNext: () => {
        const current = sessionRef.current
        if (!current) return
        applyResult(
          current.playlistId,
          nextTrack(toQueue(current), repeatRef.current, {
            shuffle: shuffleRef.current,
            random: Math.random,
          }),
        )
      },
      goPrevious: () => {
        const current = sessionRef.current
        if (!current) return
        applyResult(current.playlistId, previousTrack(toQueue(current)))
      },
      cycleRepeatMode: () => setRepeat((mode) => cycleRepeat(mode)),
      toggleShuffle: () => {
        const nextShuffle = !shuffleRef.current
        setShuffle(nextShuffle)
        shuffleRef.current = nextShuffle
        const current = sessionRef.current
        if (!current) return
        const playlist = libraryRef.current.playlists.find((item) => item.id === current.playlistId)
        const savedIds = playlist?.tracks.map((track) => track.id) ?? current.trackIds
        const ordered = orderForShuffle(toQueue(current), nextShuffle, savedIds, Math.random)
        setSession({
          ...current,
          trackIds: ordered.trackIds,
          index: ordered.index,
          failedIds: ordered.failedIds,
        })
      },
      seek: (seconds) => {
        setCurrentTime(seconds)
        playerRef.current?.seekTo(seconds, true)
      },
      setVolume: (nextVolume) => {
        setVolumeState(nextVolume)
        volumeRef.current = nextVolume
        playerRef.current?.setVolume(nextVolume)
        if (nextVolume === 0) {
          setMuted(true)
          playerRef.current?.mute()
        } else if (mutedRef.current) {
          setMuted(false)
          playerRef.current?.unMute()
        }
      },
      toggleMute: () => {
        const nextMuted = !mutedRef.current
        setMuted(nextMuted)
        mutedRef.current = nextMuted
        if (nextMuted) playerRef.current?.mute()
        else playerRef.current?.unMute()
      },
      registerPlayer: (player) => {
        playerRef.current = player
        if (!player) return
        player.setVolume(volumeRef.current)
        if (mutedRef.current) player.mute()
      },
      reportTime: (time, nextDuration) => {
        setCurrentTime(time)
        setDuration(nextDuration)
      },
      reportEnded: () => {
        const current = sessionRef.current
        if (!current) return
        applyResult(
          current.playlistId,
          endOfTrack(toQueue(current), repeatRef.current, {
            shuffle: shuffleRef.current,
            random: Math.random,
          }),
        )
      },
      reportError: () => {
        const current = sessionRef.current
        if (!current) return
        const trackId = current.trackIds[current.index]
        if (trackId) {
          setUnavailableIds((ids) => (ids.includes(trackId) ? ids : [...ids, trackId]))
        }
        applyResult(
          current.playlistId,
          skipUnavailable(toQueue(current), repeatRef.current, {
            shuffle: shuffleRef.current,
            random: Math.random,
          }),
        )
      },
    }),
    [applyResult, clearPlayback, command, commit, currentTime, duration, issue, library, muted, nowPlayingOpen, playPlaylist, queueOpen, repeat, selectedId, session, shuffle, unavailableIds, volume],
  )

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic() {
  const value = useContext(MusicContext)
  if (!value) throw new Error('useMusic must be used within MusicProvider')
  return value
}

export function PlaybackState() {
  const { session } = useMusic()
  const state = !session ? 'idle' : session.paused ? 'paused' : 'playing'
  return <span data-playback={state} />
}
