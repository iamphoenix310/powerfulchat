import type { ResumeSection } from "@/utils/parseResumeSections"
import type { ResumeData } from "@/components/Tools/ResumeGenerator/Resumes/BlueResumeLayout"

interface ResumeFormFields {
  name: string
  email: string
  education: string
  skills: string
  experience: string
  job: string
}

export function mapSectionsToResumeData(
  form: ResumeFormFields,
  sections: ResumeSection[]
): ResumeData {
  // Simple section lookup helpers:
  const getSection = (title: string) =>
    sections.find(
      (s) => s.title.toLowerCase().includes(title.toLowerCase())
    )
  const getAllSections = (title: string) =>
    sections.filter((s) => s.title.toLowerCase().includes(title.toLowerCase()))

  // Extract fields:
  const skillsSection = getSection("skill")
  const langSection = getSection("language")
  const profileSection = getSection("profile") || getSection("summary")
  const educationSections = getAllSections("education")
  const expSections = getAllSections("experience")
  const referenceSection = getSection("reference") || getSection("referee")

  // Parse skills:
  const skills =
    skillsSection?.content.map((s) => s.replace(/^[-•] /, "")) ||
    form.skills.split(",").map((s) => s.trim())

  // Parse languages:
  const languages =
    langSection?.content.map((l) => l.replace(/^[-•] /, "")) ||
    ["English (Fluent)"]

  // Parse education:
  const education = educationSections.flatMap((sec) =>
    sec.content
      .map((line) => {
        // crude parse: "Bachelor of Business, Wardiere University, 2025 - 2029, GPA: 3.8 / 4.0"
        const [degree, institution, yearsAndGpa] = line.split(",").map((v) => v.trim())
        let start = ""
        let end = ""
        let gpa = undefined
        if (yearsAndGpa) {
          const yearMatch = yearsAndGpa.match(/(\d{4})\s*-\s*(\d{4})/)
          if (yearMatch) {
            start = yearMatch[1]
            end = yearMatch[2]
          }
          const gpaMatch = yearsAndGpa.match(/GPA:?\s*([\d. /]+)/i)
          if (gpaMatch) gpa = gpaMatch[1]
        }
        return { degree, institution, start, end, gpa }
      })
      .filter((e) => e.degree && e.institution)
  )

  // Parse experience:
  const experience = expSections.flatMap((sec) =>
    sec.content
      .map((line) => {
        // crude parse: "Marketing Manager, Borcelle Studio, 2030 - Present"
        const [title, company, years] = line.split(",").map((v) => v.trim())
        let start = ""
        let end = ""
        if (years) {
          const yearMatch = years.match(/(\d{4})\s*-\s*(\w+)/)
          if (yearMatch) {
            start = yearMatch[1]
            end = yearMatch[2]
          }
        }
        return {
          title,
          company,
          start,
          end,
          details: [] as string[],
        }
      })
      .filter((e) => e.title && e.company)
  )

  // Add details to experience from bulleted lists (if present):
  expSections.forEach((sec, idx) => {
    let currExp = experience[idx]
    if (currExp && sec.isList) {
      currExp.details = sec.content
    }
  })

  // Parse references:
  const references =
    referenceSection?.content.map((line) => {
      // crude parse: "Harper Richard, Wardiere Inc. / CEO, 123-456-7890, hello@reallygreatsite.com"
      const [name, company, phone, email] = line.split(",").map((v) => v.trim())
      return { name, company, phone, email }
    }) || []

  return {
    name: form.name,
    title: form.job,
    contact: {
      phone: "",
      email: form.email,
      address: "",
      website: "",
    },
    skills,
    languages,
    profile:
      profileSection?.content.join(" ") ||
      "Professional, motivated, and results-oriented.",
    experience,
    education,
    references,
  }
}
