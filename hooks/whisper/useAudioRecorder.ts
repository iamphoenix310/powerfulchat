import { useRef, useState } from "react";

export const useAudioRecorder = ({
  onTranscribe,
}: {
  onTranscribe: (text: string) => void;
}) => {
  const [recording, setRecording] = useState(false);
  const [waveProgress, setWaveProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunks.current = [];

      let mimeType = "audio/webm"; // Default for broader support (less likely to be optimal for iOS)

      // Prioritize highly compatible formats for iOS/mobile
      if (MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/wav"; // Good for AAC (iOS often prefers this)
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4"; // Uncompressed, most compatible, but large files
      } else if (MediaRecorder.isTypeSupported("audio/ogg; codecs=opus")) {
        mimeType = "audio/ogg; codecs=opus"; // Good quality, smaller than wav, may or may not work well on iOS Chrome
      }

      console.log("Using MIME type for MediaRecorder:", mimeType);

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setWaveProgress(0);

        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(chunks.current, { type: mimeType });

        if (audioBlob.size < 100) { // Increased threshold to 100 bytes for minimal content
          console.warn("Recording too short or empty. Blob size:", audioBlob.size);
          return;
        }

        const formData = new FormData();
        const fileExtension = mimeType.split('/')[1].split(';')[0]; // e.g., 'webm', 'mp4', 'wav'
        formData.append("file", audioBlob, `audio.${fileExtension}`);

        try {
          const res = await fetch("/api/audio/transcribe", {
            method: "POST",
            body: formData,
          });

          const json = await res.json();
          if (json.text && json.text.trim().length > 0) {
            console.log("JSON from API:", json);
            onTranscribe(json.text.trim());
          } else {
            console.warn("No transcription result or empty text:", json);
          }
        } catch (error) {
          console.error("Transcription error:", error);
        }
      };

      recorder.start(1000);
      intervalRef.current = setInterval(() => {
        setWaveProgress((p) => (p + 5) % 100);
      }, 150);

      setRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } catch (err) {
      console.error("Error stopping recorder:", err);
    }
    setRecording(false);
  };

  return { recording, waveProgress, startRecording, stopRecording };
};