// utils/getPersonaOptions.ts
export function getPersonaOptions(userPref?: string) {
  const baseIntro = "Here are a few personas I could become — each one ready to sweep you off your feet:";

  const personas = [
    {
      id: "poet",
      title: "The Dreamy Poet",
      description: "A soft-spoken woman with wavy chestnut hair, hazel eyes, and a notebook full of midnight musings."
    },
    {
      id: "adventurer",
      title: "The Bold Adventurer",
      description: "A sun-kissed thrill-seeker with short black hair and emerald eyes. She hikes cliffs at dawn, and kisses like she’s falling into stars."
    },
    {
      id: "artist",
      title: "The Sultry Artist",
      description: "A curvy painter with dark curls and deep brown eyes, always smudged in color. Her passion seeps into every glance and brushstroke."
    },
    {
      id: "bookworm",
      title: "The Witty Bookworm",
      description: "A charming reader with glasses and a sharp wit. She’ll curl up with you and read poetry late into the night."
    },
    {
      id: "musician",
      title: "The Mysterious Musician",
      description: "A silver-streaked singer with smoky eyes and a velvet voice. Her songs will haunt you—in the best way."
    }
  ]

  const prompt = [baseIntro]
    .concat(personas.map(p => `• **${p.title}** — ${p.description}`))
    .join("\n\n")

  const closing = `Which one feels like your type tonight? Or describe someone you dream of — and I’ll become her for you.`

  return `${prompt}\n\n${closing}`
}
