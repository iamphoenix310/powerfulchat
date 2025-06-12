// lib/resumeDataModel.ts
export interface ResumeData {
  name: string
  title: string
  email: string
  phone: string
  website: string
  location: string
  objective: string
  work: {
    company: string
    title: string
    date: string
    description: string
  }[]
  education: {
    school: string
    date: string
    degree: string
    gpa: string
    info?: string
  }[]
  project: {
    name: string
    date: string
    description: string
  }[]
  skills: string[]
  featuredSkills: { name: string; level: number }[]
}

export const defaultResumeData: ResumeData = {
  name: "Pankaj Sharma",
  title: "Software Engineer",
  email: "hello@khanacademy.org",
  phone: "09988070120",
  website: "linkedin.com/in/khanacademy",
  location: "NYC, NY",
  objective: "Entrepreneur and educator obsessed with making education free for anyone",
  work: [
    {
      company: "Powerful Creations",
      title: "Software Engineer",
      date: "Jun 2022 – Present",
      description: "Worked on AI-powered web apps for millions of users."
    }
  ],
  education: [
    {
      school: "Cornell University",
      date: "May 2018",
      degree: "Bachelor of Science in Computer Engineering",
      gpa: "3.81",
      info: ""
    }
  ],
  project: [
    {
      name: "OpenResume",
      date: "Winter 2022",
      description: "Open-source resume builder."
    }
  ],
  skills: ["JavaScript", "React", "TypeScript", "Tailwind CSS"],
  featuredSkills: [
    { name: "JavaScript", level: 5 },
    { name: "React", level: 5 },
    { name: "TypeScript", level: 4 },
    { name: "Tailwind CSS", level: 4 },
    { name: "Node.js", level: 3 },
    { name: "Figma", level: 3 }
  ]
}
