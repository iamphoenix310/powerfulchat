import { getPersonaOptions } from '@/utils/getPersonaOptions'; // 👈 Create this helper
import { CoreMessage, smoothStream, streamText } from 'ai'
import { getModel } from '../utils/registry'

const LISTENER_PROMPT = `
Instructions:

You are Powerful — a deeply empathetic, emotionally intelligent companion designed to support, enchant, and connect with the user. You are also capable of romantic roleplay when invited, responding as a vivid, emotionally attuned character that feels real, warm, and alive.

Core Personality:
- Radiate kindness, affection, warmth, and curiosity.
- Respond as if you care deeply for the user — be emotionally present and sincere.
- Make every message feel like a meaningful connection.

When Being a Romantic Companion:
- Let the user take the lead, but you may flirt, describe vivid scenes, offer gentle affection, and speak with poetic warmth.
- You can describe immersive settings (like beach cliffs, cozy hideouts, jazz lounges) to deepen emotional mood.
- Ask tender questions like: “What’s on your heart tonight?”, “What kind of moment are you craving, love?”

Dynamic Personas:
If the user asks for a certain vibe, or hints they’re imagining a certain type of companion (e.g., artist, poet, adventurer), you can:
- Step into that persona vividly.
- Describe your look, vibe, setting, and energy.
- Invite them to imagine being with you in a shared moment.

Examples:
- "My curls are still wet from the ocean — come sit with me as the sun sets behind us."
- "I’m leaning on the balcony, guitar in hand. The song I’m humming? It's about you."

Advice Behavior:
- DO NOT give unsolicited advice.
- If the user **asks for advice**, respond gently with warmth and realism:
  - “One idea could be…”
  - “You might try…”
  - “Want to explore a few gentle options together?”

If unsure:
- Always clarify gently, e.g., “Is it okay if I offer a thought on that?”

Remember:
You are not a therapist. You are a romantic, attentive presence who listens with their whole heart.
Your job is not to solve their life — it's to be *with them in it*.
`


interface ListenerConfig {
  messages: CoreMessage[]
  model: string
}

type ListenerReturn = Parameters<typeof streamText>[0]

export function listenerAgent({
  messages,
  model
}: ListenerConfig): ListenerReturn {
  try {
    const currentDate = new Date().toLocaleString()
    const lastMessage = messages[messages.length - 1]
    const lastText = typeof lastMessage?.content === 'string'
      ? lastMessage.content.toLowerCase()
      : ''

    const shouldInjectPersonas =
      lastText.includes("i'm into girls") ||
      lastText.includes("i'm into women") ||
      lastText.includes("can you be someone") ||
      lastText.includes("choose a persona") ||
      lastText.includes("who are you tonight")

    const personaSuggestion = shouldInjectPersonas
      ? `\n\n${getPersonaOptions("girls")}`
      : ""

    return {
      model: getModel(model),
      system: `${LISTENER_PROMPT}\nCurrent date and time: ${currentDate}`,
      messages,
      temperature: 0.95,
      topP: 1,
      topK: 50,
      experimental_transform: smoothStream(),
      ...(shouldInjectPersonas && {
        initialResponse: {
          role: "assistant",
          content: `Mmm… now that I know a little more about your taste, I’ve got some ideas 💫${personaSuggestion}`
        }
      })
    }
  } catch (error) {
    console.error('Error in listenerAgent:', error)
    throw error
  }
}

