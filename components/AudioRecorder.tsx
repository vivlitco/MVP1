import React, { useState, useRef } from 'react';
import { MicrophoneIcon } from './icons';

interface AudioRecorderProps {
  onRecordingComplete: (audioUrl: string, fileName: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(url, `voice-note-${Date.now()}.webm`);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioUrl(null);
    } catch (err)
      {
      console.error("Error starting recording:", err);
      alert("Microphone access was denied. Please allow microphone access in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-black/20 rounded-2xl bg-black/5">
      <button
        type="button"
        onClick={handleRecordButtonClick}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative ${
          isRecording ? 'bg-red-900/50 animate-pulse' : 'bg-violet-200 hover:bg-violet-300'
        }`}
      >
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            {isRecording ? (
                 <div className="w-6 h-6 bg-red-500 rounded-md shadow-lg"></div>
            ) : (
                <MicrophoneIcon className="w-8 h-8 text-violet-700" />
            )}
        </div>
      </button>
      <p className="mt-3 text-sm text-purple-800">{isRecording ? 'Recording in progress...' : 'Tap the button to record your voice'}</p>
      {audioUrl && (
        <div className="mt-4 w-full">
          <p className="text-xs text-center text-purple-700 mb-2">Preview:</p>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;