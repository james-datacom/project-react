import { describe, expect, it } from 'vitest'
import { fetchYouTubeSearch, youtubeSearchUrl } from './youtube-search.ts'

const key = 'test-key'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

describe('youtube search', () => {
  it('requests the Data API for videos, channels, and playlists', () => {
    const url = youtubeSearchUrl('King of Kings', key)
    expect(url.startsWith('https://www.googleapis.com/youtube/v3/search?')).toBe(true)
    expect(url).toContain('part=snippet')
    expect(url).toContain('type=video%2Cchannel%2Cplaylist')
    expect(url).toContain('maxResults=10')
    expect(url).toContain(`q=${encodeURIComponent('King of Kings').replace(/%20/g, '+')}`)
    expect(url).toContain('key=test-key')
  })

  it('maps a video, a channel, and a playlist', async () => {
    const outcome = await fetchYouTubeSearch('kings', key, async () =>
      jsonResponse({
        items: [
          {
            id: { kind: 'youtube#video', videoId: 'dQw4w9WgXcQ' },
            snippet: {
              title: 'King of Kings',
              channelTitle: 'Hillsong Worship',
              thumbnails: { medium: { url: 'https://i.ytimg.com/medium.jpg' } },
            },
          },
          {
            id: { kind: 'youtube#channel', channelId: 'UC1234567890123456789012' },
            snippet: {
              channelTitle: 'Lauren Daigle',
              title: 'Lauren Daigle',
              thumbnails: { medium: { url: 'https://yt3.ggpht.com/artist.jpg' } },
            },
          },
          {
            id: { kind: 'youtube#playlist', playlistId: 'PLabc123' },
            snippet: {
              title: 'Sunday Playlist',
              channelTitle: 'Ignored',
              thumbnails: { default: { url: 'https://i.ytimg.com/playlist.jpg' } },
            },
          },
        ],
      }),
    )

    expect(outcome).toEqual({
      ok: true,
      items: [
        {
          kind: 'song',
          id: 'dQw4w9WgXcQ',
          title: 'King of Kings',
          artist: 'Hillsong Worship',
          artworkUrl: 'https://i.ytimg.com/medium.jpg',
        },
        {
          kind: 'artist',
          id: 'UC1234567890123456789012',
          title: 'Lauren Daigle',
          artist: '',
          artworkUrl: 'https://yt3.ggpht.com/artist.jpg',
        },
        {
          kind: 'playlist',
          id: 'PLabc123',
          title: 'Sunday Playlist',
          artist: '',
          artworkUrl: 'https://i.ytimg.com/playlist.jpg',
        },
      ],
    })
  })

  it('uses the default thumbnail when medium is missing', async () => {
    const outcome = await fetchYouTubeSearch('kings', key, async () =>
      jsonResponse({
        items: [
          {
            id: { kind: 'youtube#video', videoId: 'dQw4w9WgXcQ' },
            snippet: {
              title: 'King of Kings',
              channelTitle: 'Hillsong Worship',
              thumbnails: { default: { url: 'https://i.ytimg.com/default.jpg' } },
            },
          },
        ],
      }),
    )
    expect(outcome).toMatchObject({
      ok: true,
      items: [{ artworkUrl: 'https://i.ytimg.com/default.jpg' }],
    })
  })

  it('drops an item with no id', async () => {
    const outcome = await fetchYouTubeSearch('kings', key, async () =>
      jsonResponse({
        items: [
          { id: { kind: 'youtube#video' }, snippet: { title: 'Missing id' } },
          {
            id: { kind: 'youtube#video', videoId: 'dQw4w9WgXcQ' },
            snippet: { title: 'King of Kings', channelTitle: 'Hillsong Worship' },
          },
        ],
      }),
    )
    expect(outcome).toMatchObject({ ok: true, items: [{ id: 'dQw4w9WgXcQ', title: 'King of Kings' }] })
  })

  it('treats an empty items array as an empty match', async () => {
    const outcome = await fetchYouTubeSearch('none', key, async () => jsonResponse({ items: [] }))
    expect(outcome).toEqual({ ok: true, items: [] })
  })

  it('fails closed without inventing hits', async () => {
    const missingKey = await fetchYouTubeSearch('kings', '', async () => {
      throw new Error('should not fetch')
    })
    const failed = await fetchYouTubeSearch('kings', key, async () => new Response('', { status: 403 }))
    const thrown = await fetchYouTubeSearch('kings', key, async () => {
      throw new Error('offline')
    })
    expect(missingKey).toEqual({ ok: false })
    expect(failed).toEqual({ ok: false })
    expect(thrown).toEqual({ ok: false })
  })
})
