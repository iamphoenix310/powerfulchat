// ResumeGenerator.tsx
'use client'
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, FileText, Briefcase, GraduationCap, Award, Mail, User } from 'lucide-react'
import { RESUME_TEMPLATES, type ResumeTemplateType } from "./resumeTemplates"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { ResumePdfDocument } from "./ResumePdfDocument"
import { stripMarkdown } from "@/utils/stripMarkdown"
import { parseResumeSections, type ResumeSection } from "@/utils/parseResumeSections"
import { Label } from "@/components/ui/label"
import AdBlock from "@/components/Ads/AdBlock"
import BlueResumeLayout from "@/components/Tools/ResumeGenerator/Resumes/BlueResumeLayout"
import { mapSectionsToResumeData } from "@/utils/mapSectionsToResumeData"
import BlueResumePdfDocument from "@/components/Tools/ResumeGenerator/Resumes/BlueResumePdfDocument"



export interface ResumeFormFields {
  name: string
  email: string
  education: string
  skills: string
  experience: string
  job: string
}

interface ResumeGeneratorProps {
  initialValues?: Partial<ResumeFormFields>
  mode?: "resume" | "cover-letter"
  className?: string
}

export default function ResumeGenerator({ initialValues = {}, mode = "resume", className = "" }: ResumeGeneratorProps) {
  const [form, setForm] = useState<ResumeFormFields>({
    name: initialValues.name || "",
    email: initialValues.email || "",
    education: initialValues.education || "",
    skills: initialValues.skills || "",
    experience: initialValues.experience || "",
    job: initialValues.job || "",
  })

  const [template, setTemplate] = useState<ResumeTemplateType>("modern")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("create")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const getPrompt = () => {
    if (mode === "cover-letter") {
      return `
You are a professional career advisor and an expert cover letter writer. Write a modern, compelling cover letter for the following candidate, tailored to the target job, using clear sections and impactful language:
- Name: ${form.name}
- Email: ${form.email}
- Education: ${form.education}
- Skills: ${form.skills}
- Experience: ${form.experience}
- Target Job: ${form.job}

FORMAT: Start with the candidate's contact information at the top. Then add a formal greeting. Use separate paragraphs for introduction, relevant skills/experience, and why they are a perfect fit for the target job. Close with a call to action and a professional sign-off. Output only plain text, with clear separation for each section. Do NOT use Markdown or special characters.
      `.trim()
    }
    return `
You are an expert professional resume writer and career coach. Write a detailed, visually rich, modern resume for the following candidate, in this order:

1. Name and Email (top, prominent)
2. Professional Summary (2-3 sentences, tailored to the target job)
3. Key Skills (bullet or comma-separated, if possible)
4. Work Experience (job title, company, years, then bullet points of major accomplishments and responsibilities, use action verbs)
5. Education (degree/certificate, institution, years)
6. Certifications (if any)
7. Projects or Achievements (if relevant)
8. References available upon request.

Candidate info:
- Name: ${form.name}
- Email: ${form.email}
- Education: ${form.education}
- Skills: ${form.skills}
- Experience: ${form.experience}
- Target Job: ${form.job}

FORMAT: Use UPPERCASE section headings (e.g. PROFESSIONAL SUMMARY, SKILLS, EXPERIENCE). For experience and skills, include lists if possible. Do NOT use Markdown or special characters. Use plain text only, but structure clearly with headings, indents, and line breaks. Make the content engaging and result-oriented, with numbers and context where possible. Output only the resume content, nothing else.
    `.trim()
  }

  const handleGenerate = async () => {
    setLoading(true)
    setResult("")
    const prompt = getPrompt()

    const res = await fetch("/api/tools/generate-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
    const data = await res.json()
    setResult(stripMarkdown(data.text || ""))
    setLoading(false)
    setActiveTab("preview")
  }

  // Download as txt
  const handleDownloadTxt = () => {
    const cleanResult = stripMarkdown(result)
    const element = document.createElement("a")
    const file = new Blob([cleanResult], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = mode === "cover-letter" ? "cover-letter.txt" : "resume.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const parsedSections = result ? parseResumeSections(stripMarkdown(result)) : []

  return (
    <div className={`w-full min-h-screen flex flex-col items-center justify-start bg-background py-10 ${className}`}>
      {/* Top margin for nav */}
      <div className="flex-1 flex flex-row w-full max-w-7xl justify-center gap-8">
        {/* Left Ads */}
        {/* <div className="flex flex-col justify-start min-w-[180px]">

            <AdBlock adSlot="9995634858" className="my-6" />

        </div> */}
        {/* Main Content */}
        <div className="w-full max-w-2xl flex flex-col mx-auto">
            <AdBlock adSlot="5382119347" className="my-6" />
          <Card className="shadow-xl border-0 min-h-[800px]">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-3xl font-bold">
                {mode === "cover-letter" ? "Professional Cover Letter Generator" : "Professional Resume Builder"}
              </CardTitle>
              <CardDescription className="text-primary-foreground/90">
                Create a standout {mode === "cover-letter" ? "cover letter" : "resume"} in minutes with our AI-powered tool.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="create">Create</TabsTrigger>
                  <TabsTrigger value="preview" disabled={!result}>Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="create" className="space-y-6">
                    {/* Template Choosing Goes Here */}
                  {/* <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Choose Template Style:</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {RESUME_TEMPLATES.map((t) => (
                        <Button
                          key={t.value}
                          variant={t.value === template ? "default" : "outline"}
                          size="sm"
                          className={`rounded-md ${t.value === template ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                          onClick={() => setTemplate(t.value as ResumeTemplateType)}
                        >
                          {t.label}
                        </Button>
                      ))}
                    </div>
                  </div> */}
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleGenerate()
                    }}
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={handleChange}
                            required
                            autoFocus
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            placeholder="johndoe@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="education" className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Education
                        </Label>
                        <Textarea
                          id="education"
                          name="education"
                          placeholder="B.S. in Computer Science, University of California, 2018-2022"
                          value={form.education}
                          onChange={handleChange}
                          rows={2}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skills" className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Skills
                        </Label>
                        <Textarea
                          id="skills"
                          name="skills"
                          placeholder="JavaScript, React, Node.js, UI/UX Design, Project Management"
                          value={form.skills}
                          onChange={handleChange}
                          rows={2}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience" className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Work Experience
                        </Label>
                        <Textarea
                          id="experience"
                          name="experience"
                          placeholder="Frontend Developer at Tech Co (2020-2022), UI Designer at Design Agency (2018-2020)"
                          value={form.experience}
                          onChange={handleChange}
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job" className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Target Job Title
                        </Label>
                        <Input
                          id="job"
                          name="job"
                          placeholder="Senior Frontend Developer"
                          value={form.job}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full mt-6"
                      type="submit"
                      size="lg"
                      disabled={loading || !form.name || !form.email || !form.job}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          Generating...
                        </>
                      ) : (
                        `Generate ${mode === "cover-letter" ? "Cover Letter" : "Resume"}`
                      )}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="preview">
                    {result && (
                        <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                            Your {mode === "cover-letter" ? "Cover Letter" : "Resume"}
                            </h2>
                            <div className="flex gap-2">
                            <Button onClick={handleDownloadTxt} variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Download TXT
                            </Button>
                            <PDFDownloadLink
                                document={
                                    <BlueResumePdfDocument data={mapSectionsToResumeData(form, parsedSections)} />
                                }
                                fileName={mode === "cover-letter" ? "cover-letter.pdf" : "resume.pdf"}
                                >
                                {({ loading: pdfLoading }) => (
                                    <Button variant="default" size="sm" disabled={pdfLoading}>
                                    <Download className="w-4 h-4 mr-2" />
                                    {pdfLoading ? "Preparing..." : "Download PDF"}
                                    </Button>
                                )}
                                </PDFDownloadLink>
                                                            </div>
                        </div>
                        {/* Replace Card preview with BlueResumeLayout */}
                        <BlueResumeLayout data={mapSectionsToResumeData(form, parsedSections)} />
                        </div>
                    )}
                    </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
          {/* Bottom Ad Banner */}
          <div className="flex justify-center items-center border-0 shadow-xl">
            <AdBlock adSlot="2013719979" className="my-6" />
          </div>
        </div>
        {/* Right Ads */}
        <div className="hidden xl:flex flex-col justify-start min-w-[180px]">
           <AdBlock adSlot="4831455009" className="my-6" />
        </div>
      </div>
    </div>
  )
}
