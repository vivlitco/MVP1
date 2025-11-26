import React, { useState, useEffect } from 'react';
import { Note, NoteType } from '../types';
import { XMarkIcon, DocumentTextIcon, PhotoIcon, VideoCameraIcon, MicrophoneIcon } from './icons';
import AudioRecorder from './AudioRecorder';

interface AddNoteProps {
  onSaveNote: (note: Note) => void;
  onClose: () => void;
  noteToEdit: Note | null;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const AddNote: React.FC<AddNoteProps> = ({ onSaveNote, onClose, noteToEdit }) => {
  const [noteType, setNoteType] = useState<NoteType>(NoteType.TEXT);
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<{ url: string; fileName: string } | null>(null);
  
  const isEditing = !!noteToEdit;

  useEffect(() => {
    if (isEditing) {
      setNoteType(noteToEdit.type);
      switch(noteToEdit.type) {
        case NoteType.TEXT:
          setTextContent(noteToEdit.content);
          break;
        case NoteType.IMAGE:
        case NoteType.VIDEO:
          setFilePreview(noteToEdit.content);
          break;
        case NoteType.AUDIO:
          setAudioData({ url: noteToEdit.content, fileName: noteToEdit.fileName || 'voice-note.webm' });
          break;
      }
    }
  }, [noteToEdit, isEditing]);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        const url = await fileToDataUrl(selectedFile);
        setFilePreview(url);
    }
  };
  
  const handleAudioComplete = (audioUrl: string, fileName: string) => {
    setAudioData({ url: audioUrl, fileName });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let noteData: Partial<Note> = {};
    const id = isEditing ? noteToEdit.id : `note-${Date.now()}`;

    switch (noteType) {
      case NoteType.TEXT:
        if (textContent.trim()) {
          noteData = { type: NoteType.TEXT, content: textContent };
        }
        break;
      case NoteType.IMAGE:
      case NoteType.VIDEO:
        if (file && filePreview) { // New file uploaded
            noteData = { type: noteType, content: filePreview, fileName: file.name };
        } else if (isEditing && filePreview) { // Using existing file
            noteData = { type: noteType, content: noteToEdit.content, fileName: noteToEdit.fileName };
        }
        break;
      case NoteType.AUDIO:
        if (audioData) {
          noteData = { type: NoteType.AUDIO, content: audioData.url, fileName: audioData.fileName };
        }
        break;
    }
    
    if (Object.keys(noteData).length > 0) {
      onSaveNote({ id, ...noteData } as Note);
      onClose();
    } else {
        alert("Please add some content to your note!");
    }
  };
  
  const renderInput = () => {
    switch(noteType) {
        case NoteType.IMAGE:
        case NoteType.VIDEO:
            const acceptType = noteType === NoteType.IMAGE ? 'image/*' : 'video/*';
            return (
                <div>
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-purple-300/50 border-dashed rounded-2xl cursor-pointer bg-white/40 hover:bg-white/60 transition-colors">
                        {filePreview ? (
                            noteType === NoteType.IMAGE ? 
                            <img src={filePreview} alt="preview" className="h-full w-full object-contain p-2 rounded-xl"/> :
                            <video src={filePreview} className="h-full w-full object-contain p-2 rounded-xl" controls/>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <svg className="w-10 h-10 mb-4 text-purple-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                <p className="mb-2 text-sm text-purple-800"><span className="font-semibold">Click to upload</span></p>
                                <p className="text-xs text-purple-700">A beautiful {noteType.toLowerCase()}</p>
                            </div>
                        )}
                        <input id="file-upload" type="file" className="hidden" accept={acceptType} onChange={handleFileChange} />
                    </label>
                </div>
            )
        case NoteType.AUDIO:
            return <div><AudioRecorder onRecordingComplete={handleAudioComplete}/></div>
        case NoteType.TEXT:
        default:
             return <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Write something from the heart..." rows={6} className="w-full p-4 bg-white/60 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition placeholder:text-purple-500/80 text-purple-900" />
    }
  }

  const noteTypes: { key: NoteType; label: string; icon: React.FC<{className?: string}> }[] = [
    { key: NoteType.TEXT, label: 'Text', icon: DocumentTextIcon },
    { key: NoteType.IMAGE, label: 'Image', icon: PhotoIcon },
    { key: NoteType.VIDEO, label: 'Video', icon: VideoCameraIcon },
    { key: NoteType.AUDIO, label: 'Voice', icon: MicrophoneIcon },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-40 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-rose-50 to-violet-100 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 w-full max-w-md relative border border-white/60 animate-scale-in">
        <button onClick={onClose} className="absolute -top-3 -right-3 w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-purple-800 hover:text-purple-900 hover:scale-110 transition-all z-10 shadow-lg border border-white/50">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h3 className="text-center font-['Dancing_Script'] text-5xl font-bold text-purple-900 mb-6">{isEditing ? 'Edit Your Note' : 'Add a New Note'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center items-center gap-2 bg-black/5 p-1.5 rounded-full my-6">
            {noteTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                    key={type.key}
                    type="button"
                    onClick={() => setNoteType(type.key)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold transition-all rounded-full ${noteType === type.key ? 'bg-white/80 text-purple-900 shadow-md' : 'text-purple-700 hover:text-purple-900'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              )
            })}
          </div>
          
          <div className="mt-6">
            {renderInput()}
          </div>


          <div className="mt-8 flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-pink-500 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50">
              {isEditing ? 'Update Note' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes scale-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
      `}</style>
    </div>
  );
};

export default AddNote;