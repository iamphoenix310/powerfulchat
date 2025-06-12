// components/ResumeBuilder/BlueResumeLayout.tsx
import { Mail, Phone, Globe, MapPin } from "lucide-react"

interface Theme {
  color: string
  font: string
  fontSize: number
}

interface ResumeData {
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

export default function BlueResumeLayout({
  data,
  theme,
}: {
  data: ResumeData
  theme: Theme
}) {
  // Helper for featured skills (show dots)
  const renderFeaturedSkills = () => (
    <div className="grid grid-cols-2 gap-y-2 mt-1">
      {data.featuredSkills.map((skill, idx) => (
        <div key={skill.name + idx} className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-800">{skill.name}</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`inline-block w-2 h-2 rounded-full ${i < skill.level ? "" : "opacity-30"}`}
                style={{ background: theme.color }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // Section heading style using theme color
  const sectionHeading = `uppercase tracking-wide text-xs font-bold mb-2`
  const sectionHeadingStyle = { color: theme.color }

  return (
    <div
      className="flex flex-col lg:flex-row w-full max-w-3xl mx-auto shadow-2xl rounded-xl overflow-hidden border bg-white"
      style={{
        fontFamily: theme.font,
        fontSize: `${theme.fontSize}px`,
      }}
    >
      {/* Sidebar */}
      <aside
        className="w-full lg:w-1/3 py-8 px-6 flex flex-col gap-6"
        style={{ background: theme.color, color: "#fff", minHeight: 500 }}
      >
        {/* Name/Title */}
        <div>
          <div className="text-2xl font-bold">{data.name}</div>
          <div className="uppercase text-blue-100 font-semibold tracking-wider mt-1">
            {data.title}
          </div>
        </div>
        {/* Contact */}
        <div className="space-y-2 text-sm">
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 opacity-80" /> {data.email}
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 opacity-80" /> {data.phone}
            </div>
          )}
          {data.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 opacity-80" /> {data.website}
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 opacity-80" /> {data.location}
            </div>
          )}
        </div>
        {/* Skills */}
        <div>
          <div className="font-semibold uppercase text-blue-100 mb-2 tracking-wider" style={{ color: "#DBEAFE" }}>
            Skills
          </div>
          <ul className="flex flex-wrap gap-1 text-xs">
            {data.skills.map((skill, i) => (
              <li key={i} className="bg-white/20 rounded px-2 py-1">
                {skill}
              </li>
            ))}
          </ul>
        </div>
        {/* Featured Skills */}
        <div>
          <div className="font-semibold uppercase text-blue-100 mb-2 tracking-wider" style={{ color: "#DBEAFE" }}>
            Proficiency
          </div>
          {renderFeaturedSkills()}
        </div>
      </aside>
      {/* Main Content */}
      <main className="w-full lg:w-2/3 px-8 py-10 flex flex-col gap-8 bg-white">
        {/* Objective */}
        {data.objective && (
          <section>
            <div className={sectionHeading} style={sectionHeadingStyle}>
              Objective
            </div>
            <div className="text-gray-800">{data.objective}</div>
          </section>
        )}
        {/* Work Experience */}
        <section>
          <div className={sectionHeading} style={sectionHeadingStyle}>
            Work Experience
          </div>
          <div className="flex flex-col gap-4">
            {data.work.map((job, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{job.title}</span>
                  <span className="text-xs text-gray-500">{job.date}</span>
                </div>
                <div className="text-sm text-gray-800">{job.company}</div>
                <div className="text-xs text-gray-600 mt-1">{job.description}</div>
              </div>
            ))}
          </div>
        </section>
        {/* Education */}
        <section>
          <div className={sectionHeading} style={sectionHeadingStyle}>
            Education
          </div>
          <div className="flex flex-col gap-3">
            {data.education.map((edu, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{edu.school}</span>
                  <span className="text-xs text-gray-500">{edu.date}</span>
                </div>
                <div className="text-sm text-gray-800">{edu.degree}</div>
                <div className="text-xs text-gray-600 mt-1">
                  GPA: {edu.gpa} {edu.info && <>| {edu.info}</>}
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Projects */}
        {data.project && data.project.length > 0 && (
          <section>
            <div className={sectionHeading} style={sectionHeadingStyle}>
              Projects
            </div>
            <div className="flex flex-col gap-3">
              {data.project.map((proj, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{proj.name}</span>
                    <span className="text-xs text-gray-500">{proj.date}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{proj.description}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
