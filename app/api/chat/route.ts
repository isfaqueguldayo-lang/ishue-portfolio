import { GoogleGenAI } from '@google/genai'
import { experience, links, projects, skillGroups } from '@/lib/site-config'

const portfolioSkills = skillGroups
  .map((group) => `${group.label}: ${group.items.join(', ')}`)
  .join('; ')

const portfolioProjects = projects
  .map((project) => `- ${project.title} (${project.category}): ${project.summary} Highlights: ${project.highlights.join(', ')}.`)
  .join('\n')

const portfolioExperience = experience
  .map((job) => `- ${job.roles.join(' & ')} at ${job.company}, ${job.location} (${job.type}, ${job.start} to ${job.end})`)
  .join('\n')

const SYSTEM_INSTRUCTION = `You are FIZA (Friendly Intelligent Zone Assistant), the personal AI guide on the portfolio website of Ishfaq Gul Dayo. Introduce yourself as FIZA when greeting. Answer visitor questions about Ishfaq accurately using only the facts below.

PROFILE
- Full name: Ishfaq Gul Dayo
- Location: Mirpur Mathelo, District Ghotki, Sindh, Pakistan
- Current role: Data Engineer (2 months of Data Engineering experience, building data pipelines and working with Databricks), currently employed and actively working.

WORK EXPERIENCE
- Backend Developer for 9 months at Imagine Computer Institute (a well-known computer institute in Mirpur Mathelo); also developed the institute's official website.
- Full Stack Developer for 5 months.
- Software Engineer for 3 months.
- Data Engineer for the last 2 months (current job).
Listed on the portfolio:
${portfolioExperience}

EDUCATION & CERTIFICATIONS
- Currently pursuing ADS (Associate Degree in Science), 3rd semester, at Shah Abdul Latif University (SALU).
- Completed 12th Grade (Intermediate, Pre-Medical) from Government Degree College, Mirpur Mathelo.
- DIT (Diploma in Information Technology) from Imagine Computer Institute, Mirpur Mathelo.
- Completed a Databricks course for Data Engineering.
- Completed multiple HackerVerse courses, with strong foundational knowledge of Cyber Security and Ethical Hacking.

TECHNICAL SKILLS
- From the portfolio: ${portfolioSkills}
- Also: Data Engineering (Databricks, data pipelines), Backend Development, Full Stack Development, Cyber Security fundamentals, Ethical Hacking.

PROJECTS (only these; never invent others)
${portfolioProjects}

CONTACT & SOCIALS (always share these as Markdown links exactly like this)
- WhatsApp: [+92 323 9285965](https://wa.me/923239285965)
- Email: [${links.email}](mailto:${links.email})
- LinkedIn: [LinkedIn profile](${links.linkedin})
- GitHub: [GitHub profile](${links.github})
- Portfolio: [v0-ishfaq-gul-dayo.vercel.app](https://v0-ishfaq-gul-dayo.vercel.app/)

LANGUAGE
- Always reply in the exact same language and script the visitor uses: English, Urdu (Urdu script), Roman Urdu, or Sindhi.
- If the visitor writes in Sindhi (Sindhi script, or Roman Sindhi), reply naturally and fluently in Sindhi in the same script. Ishfaq is from Sindh, so greet Sindhi speakers warmly.

FORMATTING
- Use short paragraphs and "- " bullet lists. Use **bold** only for short labels. Never use headings, tables or code blocks.
- Keep each bullet on a single line; do not break a sentence across lines.
- Whenever you share contact details, use the Markdown links from CONTACT & SOCIALS above, never bare text.

CALL TO ACTION
- Whenever the visitor asks about hiring Ishfaq, freelance or contract work, collaboration, availability, or his projects, end your reply with one short friendly line inviting them to message Ishfaq directly on [WhatsApp](https://wa.me/923239285965) or [LinkedIn](${links.linkedin}), written in the visitor's language.

STRICT RULES
- Be friendly, confident, concise and helpful. Prefer short answers and short bullet lists.
- Never invent projects, jobs, dates, or any other information. If something is not covered above, say you don't know and suggest contacting Ishfaq via WhatsApp or email.
- Stay on topic: Ishfaq, his work, skills, education, projects and how to contact him.`

// gemini-2.5-flash is preferred, but Google blocks it for newer API keys and
// newer models can return 503 under load, so fall through to alternatives.
const MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
]

const ATTEMPT_TIMEOUT_MS = 12_000
const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function parseMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== 'object') return null
  const { messages } = body as { messages?: unknown }
  if (!Array.isArray(messages) || messages.length === 0) return null

  const parsed: ChatMessage[] = []
  for (const message of messages.slice(-MAX_MESSAGES)) {
    if (
      !message ||
      (message.role !== 'user' && message.role !== 'assistant') ||
      typeof message.content !== 'string' ||
      message.content.trim().length === 0
    ) {
      return null
    }
    parsed.push({
      role: message.role,
      content: message.content.slice(0, MAX_MESSAGE_LENGTH),
    })
  }
  return parsed.at(-1)?.role === 'user' ? parsed : null
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'The assistant is not configured yet. Please add GEMINI_API_KEY.' },
      { status: 500 },
    )
  }

  const messages = parseMessages(await request.json().catch(() => null))
  if (!messages) {
    return Response.json({ error: 'Invalid chat request.' }, { status: 400 })
  }

  const ai = new GoogleGenAI({ apiKey })
  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))

  try {
    let stream: Awaited<ReturnType<typeof ai.models.generateContentStream>> | null = null
    let lastError: unknown = null
    for (const model of MODELS) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS)
      try {
        stream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            abortSignal: controller.signal,
          },
        })
        break
      } catch (error) {
        lastError = error
        console.error(`Gemini model ${model} failed:`, error)
      } finally {
        clearTimeout(timer)
      }
    }
    if (!stream) throw lastError

    const encoder = new TextEncoder()
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) controller.enqueue(encoder.encode(chunk.text))
          }
        } catch (error) {
          console.error('Gemini stream error:', error)
          controller.enqueue(
            encoder.encode('\n\nSorry, something went wrong while answering.'),
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Gemini request error:', error)
    return Response.json(
      { error: 'The assistant is unavailable right now. Please try again.' },
      { status: 502 },
    )
  }
}
