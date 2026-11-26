import { MAX_TTS_LENGTH } from '@/lib/tts-config'

const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'
const MODEL_ID = 'eleven_multilingual_v2'
const ELEVENLABS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Voice is not configured. Please add ELEVENLABS_API_KEY.' }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as { text?: unknown } | null
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!text) {
    return Response.json({ error: 'Text is required.' }, { status: 400 })
  }

  const upstream = await fetch(ELEVENLABS_URL, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: text.slice(0, MAX_TTS_LENGTH),
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
    signal: request.signal,
  }).catch((error: unknown) => {
    console.error('ElevenLabs request error:', error)
    return null
  })

  if (!upstream?.ok || !upstream.body) {
    if (upstream) console.error('ElevenLabs error:', upstream.status, await upstream.text().catch(() => ''))
    return Response.json({ error: 'Voice is unavailable right now.' }, { status: 502 })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  })
}
