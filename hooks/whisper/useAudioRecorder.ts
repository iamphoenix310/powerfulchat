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

      // Determine the best supported MIME type for recording
      let mimeType = "audio/webm"; // Default for broader support
      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4"; // Often uses AAC, good for iOS
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/wav"; // Uncompressed, but highly compatible
      }
      // You can add more checks if needed, like 'audio/ogg' etc.

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

        // Use the determined mimeType for the Blob
        const audioBlob = new Blob(chunks.current, { type: mimeType });

        if (audioBlob.size < 100) {
          console.warn("Recording too short or empty");
          return;
        }

        const formData = new FormData();
        // Ensure the filename extension matches the MIME type
        const filename = `audio.${mimeType.split('/')[1].split(';')[0]}`; // e.g., audio.mp4 or audio.webm
        formData.append("file", audioBlob, filename);

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
            console.warn("No transcription result:", json);
          }
        } catch (error) {
          console.error("Transcription error:", error);
        }
      };

      recorder.start();
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