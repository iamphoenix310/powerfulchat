// components/ResumeBuilder/ResumeBuilderForm.tsx
import { useState } from "react"
import type { ResumeData } from "@/lib/resumeDataModel"

export function ResumeBuilderForm({ resume, setResume }: { resume: ResumeData, setResume: (d: ResumeData) => void }) {
  // For brevity: update state inline. Add dynamic fields with arrays as needed!
  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-white rounded-xl shadow flex flex-col gap-3">
        <label className="font-semibold">Name</label>
        <input className="input" value={resume.name} onChange={e => setResume({ ...resume, name: e.target.value })} />
        <label className="font-semibold">Objective</label>
        <input className="input" value={resume.objective} onChange={e => setResume({ ...resume, objective: e.target.value })} />
        <label className="font-semibold">Email</label>
        <input className="input" value={resume.email} onChange={e => setResume({ ...resume, email: e.target.value })} />
        <label className="font-semibold">Phone</label>
        <input className="input" value={resume.phone} onChange={e => setResume({ ...resume, phone: e.target.value })} />
        <label className="font-semibold">Website</label>
        <input className="input" value={resume.website} onChange={e => setResume({ ...resume, website: e.target.value })} />
        <label className="font-semibold">Location</label>
        <input className="input" value={resume.location} onChange={e => setResume({ ...resume, location: e.target.value })} />
      </div>
      {/* Add Work Experience, Education, etc. as collapsible cards here */}
      {/* Add mapping for resume.work, resume.education, resume.project, resume.skills, resume.featuredSkills */}
    </div>
  )
}
