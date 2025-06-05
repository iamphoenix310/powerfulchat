import { useRef, useState } from "react"

export const useAudioRecorder = ({
  onTranscribe,
}: {
  onTranscribe: (text: string) => void
}) => {
  const [recording, setRecording] = useState(false)
  const [waveProgress, setWaveProgress] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunks.current = []

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setWaveProgress(0)

        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop())

        const audioBlob = new Blob(chunks.current, { type: "audio/webm" })

        if (audioBlob.size < 100) {
          console.warn("Recording too short or empty")
          return
        }

        const formData = new FormData()
        formData.append("file", audioBlob, "audio.webm")

        try {
          const res = await fetch("/api/audio/transcribe", {
            method: "POST",
            body: formData,
          })

          const json = await res.json()
          if (json.text && json.text.trim().length > 0) {
            console.log("JSON from API:", json)
            onTranscribe(json.text.trim())
          } else {
            console.warn("No transcription result:", json)
          }
        } catch (error) {
          console.error("Transcription error:", error)
        }
      }

      recorder.start()
      intervalRef.current = setInterval(() => {
        setWaveProgress((p) => (p + 5) % 100)
      }, 150)

      setRecording(true)
    } catch (err) {
      console.error("Mic access error:", err)
      setRecording(false)
    }
  }

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop()
    } catch (err) {
      console.error("Error stopping recorder:", err)
    }
    setRecording(false)
  }

  return { recording, waveProgress, startRecording, stopRecording }
}
