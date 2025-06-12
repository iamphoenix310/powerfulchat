// components/Resumes/BlueResumeLayout.tsx
import { Mail, Phone, MapPin, Globe } from "lucide-react"

export interface ResumeData {
  name: string
  title: string
  contact: {
    phone?: string
    email?: string
    address?: string
    website?: string
  }
  skills: string[]
  languages: string[]
  profile: string
  experience: {
    company: string
    title: string
    start: string
    end: string
    details: string[]
  }[]
  education: {
    degree: string
    institution: string
    start: string
    end: string
    gpa?: string
  }[]
  references?: {
    name: string
    company: string
    phone?: string
    email?: string
  }[]
}

export default function BlueResumeLayout({ data }: { data: ResumeData }) {
  return (
    <div className="flex flex-col lg:flex-row w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden mx-auto">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/3 bg-gray-700 text-white px-6 py-8 flex flex-col gap-8 min-h-[800px]">
        {/* Name & Title */}
        <div>
          <div className="text-2xl font-bold tracking-wide">{data.name}</div>
          <div className="uppercase text-blue-200 font-semibold tracking-wider mt-1">{data.title}</div>
        </div>
        {/* Contact */}
        <div className="space-y-2 text-sm">
          {data.contact.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {data.contact.phone}</div>}
          {data.contact.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {data.contact.email}</div>}
          {data.contact.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {data.contact.address}</div>}
          {data.contact.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> {data.contact.website}</div>}
        </div>
        {/* Skills */}
        <div>
          <div className="font-semibold uppercase text-blue-200 mb-2 tracking-wider">Skills</div>
          <ul className="space-y-1">
            {data.skills.map((skill, i) => (
              <li key={i} className="pl-3 relative before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-gray-300 before:rounded-full">{skill}</li>
            ))}
          </ul>
        </div>
        {/* Languages */}
        <div>
          <div className="font-semibold uppercase text-blue-200 mb-2 tracking-wider">Languages</div>
          <ul className="space-y-1">
            {data.languages.map((lang, i) => <li key={i}>{lang}</li>)}
          </ul>
        </div>
      </aside>

      {/* Main Resume Content */}
      <main className="w-full lg:w-2/3 px-8 py-10 flex flex-col gap-10 bg-white">
        {/* Profile Summary */}
        <section>
          <div className="text-blue-700 uppercase font-bold text-sm tracking-widest mb-2">Profile</div>
          <p className="text-gray-800 text-base">{data.profile}</p>
        </section>
        {/* Experience */}
        <section>
          <div className="text-blue-700 uppercase font-bold text-sm tracking-widest mb-2">Work Experience</div>
          <div className="flex flex-col gap-6">
            {data.experience.map((job, i) => (
              <div key={i}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{job.title}, {job.company}</span>
                  <span className="text-xs text-blue-800">{job.start} - {job.end}</span>
                </div>
                <ul className="list-disc ml-6 text-sm text-gray-800 mt-2 space-y-1">
                  {job.details.map((d, j) => <li key={j}>{d}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
        {/* Education */}
        <section>
          <div className="text-blue-700 uppercase font-bold text-sm tracking-widest mb-2">Education</div>
          <div className="flex flex-col gap-4">
            {data.education.map((edu, i) => (
              <div key={i}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{edu.degree}, {edu.institution}</span>
                  <span className="text-xs text-blue-800">{edu.start} - {edu.end}</span>
                </div>
                {edu.gpa && <div className="text-xs text-blue-800 mt-1">GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        </section>
        {/* References */}
        {data.references && data.references.length > 0 && (
          <section>
            <div className="text-blue-700 uppercase font-bold text-sm tracking-widest mb-2">Reference</div>
            <div className="flex flex-col gap-2 text-sm">
              {data.references.map((ref, i) => (
                <div key={i}>
                  <div className="font-semibold">{ref.name}, {ref.company}</div>
                  {ref.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {ref.phone}</div>}
                  {ref.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {ref.email}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
