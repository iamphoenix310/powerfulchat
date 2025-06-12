export interface ResumeSection {
  title: string
  content: string[]
  isList?: boolean
}

export function parseResumeSections(resume: string): ResumeSection[] {
  const lines = resume.split("\n").map((l) => l.trim())
  const sections: ResumeSection[] = []
  let current: ResumeSection | null = null

  lines.forEach((line) => {
    // Section title: all uppercase, length >= 5, not too long
    if (/^[A-Z\s]{5,}$/.test(line) && line.length < 40) {
      if (current) sections.push(current)
      current = { title: line, content: [] }
    } else if (line.startsWith("- ")) {
      // List item
      if (!current) current = { title: "DETAILS", content: [] }
      if (!current.isList) current.isList = true
      current.content.push(line.slice(2))
    } else if (line.length > 0) {
      if (!current) current = { title: "SUMMARY", content: [] }
      if (!current.isList) current.isList = false
      current.content.push(line)
    }
  })
  if (current) sections.push(current)
  return sections
}
