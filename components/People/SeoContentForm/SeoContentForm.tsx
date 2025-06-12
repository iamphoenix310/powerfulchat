'use client'

import { useState, useEffect } from "react"
import { client } from "@/app/utils/sanityClient"
import AdBlock from "@/components/Ads/AdBlock"

interface Celeb {
  name: string
  slug: { current: string }
}

interface SeoBlock {
  keyword: string
  answer: string
}

export default function SeoContentForm() {
  const [celebs, setCelebs] = useState<Celeb[]>([])
  const [slug, setSlug] = useState("")
  const [selectedName, setSelectedName] = useState("")
  const [search, setSearch] = useState("")
  const [keywords, setKeywords] = useState("")
  const [responses, setResponses] = useState<SeoBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [seoBlocks, setSeoBlocks] = useState<SeoBlock[]>([])

  useEffect(() => {
    client.fetch(`*[_type == "facesCelebs"]{ name, slug }`).then(setCelebs)
  }, [])

  useEffect(() => {
    if (slug) {
      client.fetch(
        `*[_type == "facesCelebs" && slug.current == $slug][0]{ seoContentBlocks }`,
        { slug }
      ).then(data => setSeoBlocks(data?.seoContentBlocks || []))
    } else {
      setSeoBlocks([])
    }
  }, [slug])

  const handleSubmit = async () => {
    const keywordList = keywords
      .split(/[\n,]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0)

    if (!slug || keywordList.length === 0) return

    setLoading(true)
    const res = await fetch("/api/people/seo-generate", {
      method: "POST",
      body: JSON.stringify({ slug, keywords: keywordList }),
      headers: { "Content-Type": "application/json" }
    })

    const data = await res.json()
    setLoading(false)
    setResponses(data?.blocks || [])
    setKeywords("")

    const updated = await client.fetch(
      `*[_type == "facesCelebs" && slug.current == $slug][0]{ seoContentBlocks }`,
      { slug }
    )
    setSeoBlocks(updated?.seoContentBlocks || [])
  }

  const handleSelectCelebrity = (slug: string, name: string) => {
    setSlug(slug)
    setSelectedName(name)
    setSearch("")
  }

  return (
    <div className="p-4 space-y-6">
      {/* Search + Select Celebrity */}
      <div className="space-y-2">
        <label className="font-semibold block">Search Celebrity</label>
        <input
          type="text"
          placeholder="Type to search..."
          className="border p-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <div className="bg-white border rounded shadow max-h-60 overflow-y-auto">
            {celebs
              .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
              .map(c => (
                <div
                  key={c.slug.current}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectCelebrity(c.slug.current, c.name)}
                >
                  {c.name}
                </div>
              ))}
            {celebs.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <div className="p-2 text-gray-500">No matching results</div>
            )}
          </div>
        )}

        {selectedName && (
          <div className="text-sm text-green-600 font-medium">
            Selected: {selectedName}
          </div>
        )}
      </div>

      {/* Multi-keyword input */}
      <div>
        <label className="font-semibold block mb-1">
          Enter Keywords or Questions (one per line or comma-separated)
        </label>
        <textarea
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder={`e.g.\nWhat is their net worth?\nFamous albums\nTour dates`}
          rows={5}
          className="border p-2 w-full"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !slug || !keywords.trim()}
        className="bg-gray-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate & Save"}
      </button>

      {/* New response preview */}
      {responses.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-bold">New Answers</h3>
          {responses.map((block, idx) => (
            <div key={idx} className="p-4 bg-green-50 border rounded">
              <h4 className="font-semibold text-gray-700">{block.keyword}</h4>
              <p className="text-gray-800 whitespace-pre-line">{block.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Existing SEO blocks with AdSense */}
      {seoBlocks.length > 0 && (
        <div className="mt-10 space-y-6">
          <h3 className="text-xl font-bold">All SEO Content</h3>
          {seoBlocks.map((block, idx) => (
            <div key={idx}>
              <div className="p-4 border rounded bg-gray-50">
                <h4 className="font-semibold !text-gray-800 mb-2">{block.keyword}</h4>
                <p className="!text-black-800 whitespace-pre-line">{block.answer}</p>
              </div>

              {(idx + 1) % 2 === 0 && (
                <div className="my-6">
                  <AdBlock adSlot="8397118667" className="my-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
