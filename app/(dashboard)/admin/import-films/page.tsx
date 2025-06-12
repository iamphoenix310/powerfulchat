'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'

export default function ImportFilmsPage() {
  const [ids, setIds] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [missingCelebs, setMissingCelebs] = useState<string[]>([])

  const handleImport = async () => {
    const tmdbIds = ids.split(',').map((id) => id.trim()).filter(Boolean)
    if (tmdbIds.length === 0) return

    setLoading(true)
    setResults([])
    setProgress(0)
    setMissingCelebs([])

    for (let i = 0; i < tmdbIds.length; i++) {
      const tmdbId = tmdbIds[i]

      try {
        const res = await fetch('/api/movies/import-film', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdbId })
        })

        const json = await res.json()
        if (json.missingCelebs?.length > 0) {
          setMissingCelebs((prev) => [...new Set([...prev, ...json.missingCelebs])])
        }

        setResults((prev) => [
          `${json.success ? '✅' : '❌'} TMDB ID: ${tmdbId} ${json.success ? 'Imported' : 'Failed'} ${json.error || ''}`,
          ...prev
        ])
      } catch (err) {
        setResults((prev) => [`❌ TMDB ID: ${tmdbId} failed: ${err}`, ...prev])
      }

      setProgress(Math.round(((i + 1) / tmdbIds.length) * 100))
    }

    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    let idsFromFile: string[] = []

    if (file.name.endsWith('.json')) {
      const parsed = JSON.parse(text)
      idsFromFile = Array.isArray(parsed) ? parsed.map(String) : []
    } else if (file.name.endsWith('.csv')) {
      idsFromFile = text.split(/[\r\n,]+/).map((id) => id.trim()).filter(Boolean)
    }

    setIds(idsFromFile.join(', '))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">🎬 Bulk Import Films from TMDB</h1>

      <Textarea
        rows={5}
        placeholder="Enter TMDB movie IDs, separated by commas"
        value={ids}
        onChange={(e) => setIds(e.target.value)}
        className="mb-3"
      />

      <div className="flex items-center gap-4 mb-4">
        <Input type="file" accept=".csv,.json" onChange={handleFileUpload} />
        <Button onClick={handleImport} disabled={loading || !ids.trim()}>
          {loading ? 'Importing...' : 'Start Import'}
        </Button>
      </div>

      {loading && (
        <Progress value={progress} className="h-2 mb-4" />
      )}

      {missingCelebs.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded mb-4">
          <p>👤 Missing Celebrities:</p>
          <p className="text-sm mb-1">{missingCelebs.join(', ')}</p>
          <a
            href={`/add-celebs-here?ids=${missingCelebs.join(',')}`}
            className="underline text-blue-600 text-sm"
          >
            ➕ Click here to import these celebrities
          </a>
        </div>
      )}

      <div className="bg-zinc-100 dark:bg-zinc-800 border rounded p-4 max-h-80 overflow-y-auto text-sm space-y-1">
        {results.map((msg, i) => (
          <p key={i} className="whitespace-pre-wrap">{msg}</p>
        ))}
      </div>
    </div>
  )
}
