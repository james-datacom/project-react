import { describe, expect, it } from 'vitest'
import { fetchYouTubeTitle, youtubeOembedUrl } from './oembed.ts'

const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

describe('YouTube oEmbed title', () => {
  it('requests the oEmbed URL and returns the title', async () => {
    const title = await fetchYouTubeTitle(videoUrl, async (input) => {
      expect(String(input)).toBe(youtubeOembedUrl(videoUrl))
      return new Response(JSON.stringify({ title: ' Example title ' }), { status: 200 })
    })
    expect(title).toBe('Example title')
  })

  it('returns null when the request fails or the title is missing', async () => {
    await expect(
      fetchYouTubeTitle(videoUrl, async () => new Response('', { status: 404 })),
    ).resolves.toBeNull()
    await expect(
      fetchYouTubeTitle(videoUrl, async () => new Response(JSON.stringify({}), { status: 200 })),
    ).resolves.toBeNull()
    await expect(fetchYouTubeTitle(videoUrl, async () => {
      throw new Error('offline')
    })).resolves.toBeNull()
  })
})
