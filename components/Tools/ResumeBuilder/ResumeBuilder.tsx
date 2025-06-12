// components/ResumeBuilder.tsx
'use client'
import { useState } from "react"
import { ResumeBuilderForm } from "./ResumeBuilderForm"
import BlueResumeLayout from "./BlueResumeLayout"
import { ResumeData, defaultResumeData } from "@/lib/resumeDataModel"
import { ThemeControls } from "./ThemeControls"

export default function ResumeBuilder() {
  const [resume, setResume] = useState<ResumeData>(defaultResumeData)
  const [theme, setTheme] = useState({
    color: "#2563EB",
    font: "Inter",
    fontSize: 12,
    docSize: "A4"
  })

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 max-w-7xl mx-auto py-8 px-2">
        {/* Left: Form Builder */}
        <div className="flex flex-col gap-6">
          <ResumeBuilderForm resume={resume} setResume={setResume} />
          <ThemeControls theme={theme} setTheme={setTheme} />
        </div>
        {/* Right: Live Preview */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[700px]">
            <BlueResumeLayout data={resume} theme={theme} />
            {/* Add Download/Print buttons here */}
          </div>
        </div>
      </div>
    </div>
  )
}
