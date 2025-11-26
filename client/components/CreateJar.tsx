import React, { useState, useEffect } from 'react';
import { Jar, Note, JarDirection, User } from '../types';
import AddNote from './AddNote';
import { generateCoverNote } from '../services/geminiService';
import { PlusIcon, SparklesIcon, PencilIcon, TrashIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface CreateJarProps {
  onSaveJar: (jar: Jar) => void;
  onBack: () => void;
  jarToEdit: Jar | null;
  currentUser: User | null;
}

const NotePreview: React.FC<{ note: Note; onEdit: (note: Note) => void; onRemove: (id: string) => void }> = ({ note, onEdit, onRemove }) => {
    return (
        <div className="bg-black/5 p-2.5 rounded-lg flex items-center justify-between text-sm text-purple-800">
            <span className="truncate pr-2">{note.type}: {note.fileName || 'Text Note'}</span>
            <div className="flex items-center space-x-2 flex-shrink-0">
                 <button onClick={() => onEdit(note)} className="text-blue-500 hover:text-blue-600 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onRemove(note.id)} className="text-red-500 hover:text-red-600 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}

// Moved FormInput outside the component to prevent re-rendering and focus loss on input change.
const FormInput = ({ id, label, value, onChange, placeholder }: {id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string}) => (
    <div>
      <label htmlFor={id} className="block text-lg font-medium text-purple-800 mb-2">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition placeholder:text-purple-500/80 text-purple-900"
      />
    </div>
  );

const CreateJar: React.FC<CreateJarProps> = ({ onSaveJar, onBack, jarToEdit, currentUser }) => {
  const [jarName, setJarName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

  const isEditing = !!jarToEdit;

  useEffect(() => {
    if (isEditing) {
      setJarName(jarToEdit.name);
      setRecipientName(jarToEdit.recipientName);
      setCoverNote(jarToEdit.coverNote);
      setNotes(jarToEdit.notes);
    }
  }, [jarToEdit, isEditing]);

  const handleOpenAddNote = () => {
    setNoteToEdit(null);
    setIsAddingNote(true);
  };

  const handleEditNote = (note: Note) => {
    setNoteToEdit(note);
    setIsAddingNote(true);
  };

  const handleSaveNote = (note: Note) => {
    if (notes.length >= 50 && !noteToEdit) {
      alert("You can't add more than 50 notes to a jar.");
      return;
    }
    const isEditingNote = notes.some(n => n.id === note.id);
    if (isEditingNote) {
      setNotes(notes.map(n => n.id === note.id ? note : n));
    } else {
      setNotes([...notes, note]);
    }
    setNoteToEdit(null);
  };
  
  const handleRemoveNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  }

  const handleGenerateCoverNote = async () => {
    if (!geminiPrompt.trim()) {
      alert("Please enter a theme for the cover note.");
      return;
    }
    setIsGenerating(true);
    const generatedNote = await generateCoverNote(geminiPrompt);
    setCoverNote(generatedNote);
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (!jarName.trim() || !coverNote.trim() || !recipientName.trim()) {
      alert('Please provide a jar name, recipient name, and a cover note for your jar.');
      return;
    }
    // This object is now preliminary. The final details (like id, senderName) will be
    // set in the App component, especially after a potential sign-up.
    const jarData: Jar = {
      id: isEditing ? jarToEdit.id : `temp-${Date.now()}`,
      name: jarName,
      coverNote,
      notes,
      senderName: currentUser ? currentUser.name : 'A Friend', 
      recipientName: recipientName.trim(),
      sentDate: isEditing ? jarToEdit.sentDate : new Date().toISOString(),
      direction: JarDirection.SENT,
    };
    onSaveJar(jarData);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="bg-white/30 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-lg border border-white/50">
        <h2 className="text-4xl font-bold text-purple-900 mb-8">{isEditing ? 'Edit Your Jar' : 'Create a New Jar'}</h2>
        
        <div className="space-y-6">
            <FormInput id="jarName" label="Jar Name" value={jarName} onChange={(e) => setJarName(e.target.value)} placeholder="e.g., Our Summer Memories" />
            <FormInput id="recipientName" label="Recipient's Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g., Alex Smith" />
        </div>

        {/* Cover Note Section */}
        <div className="my-8 space-y-4">
            <label htmlFor="coverNote" className="block text-lg font-medium text-purple-800">
                Jar's Cover Note
            </label>
            <textarea
                id="coverNote"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Write a heartfelt message for the top of the jar..."
                rows={4}
                className="w-full p-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition placeholder:text-purple-500/80 text-purple-900"
            />
            
            {/* AI Generation Helper */}
            <div className="p-4 border border-dashed border-black/20 rounded-2xl bg-black/5 space-y-3">
                <p className="text-sm text-purple-700">
                    <span className="font-semibold">Need inspiration?</span> Let our Vivlit Bunny write one for you! Just provide a theme.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        id="geminiPrompt"
                        type="text"
                        value={geminiPrompt}
                        onChange={(e) => setGeminiPrompt(e.target.value)}
                        placeholder="e.g., a friendship, our beach trip"
                        className="flex-grow p-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition placeholder:text-purple-500/80 text-purple-900"
                        disabled={isGenerating}
                    />
                    <button onClick={handleGenerateCoverNote} disabled={isGenerating} className="flex items-center justify-center px-5 py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 transition-all transform hover:scale-105 disabled:bg-violet-400 shadow-lg shadow-violet-500/20">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                {isGenerating && <LoadingSpinner />}
            </div>
        </div>

        {/* Add Notes */}
        <div>
            <h3 className="text-lg font-medium text-purple-800 mb-2">Notes Inside ({notes.length}/50)</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto p-2 bg-black/5 rounded-lg border border-black/10">
                {notes.length === 0 ? (
                    <p className="text-purple-700 text-center p-4">Your jar is empty. Add a note!</p>
                ) : (
                    notes.map(note => <NotePreview key={note.id} note={note} onEdit={handleEditNote} onRemove={handleRemoveNote} />)
                )}
            </div>
             <button onClick={handleOpenAddNote} className="flex items-center justify-center w-full px-4 py-3 bg-pink-500/10 text-pink-700 font-bold rounded-xl hover:bg-pink-500/20 transition-colors border border-pink-500/30">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add a Note
            </button>
        </div>

        <div className="mt-10 flex justify-between items-center">
            <button onClick={onBack} className="px-6 py-2.5 bg-black/10 text-purple-800 font-bold rounded-full hover:bg-black/20 transition-all">
              Back
            </button>
            <button onClick={handleSave} className="px-8 py-3 bg-pink-500 text-white text-lg font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50">
                {isEditing ? 'Update Jar' : 'Save & Seal the Jar'}
            </button>
        </div>
      </div>

      {isAddingNote && <AddNote onSaveNote={handleSaveNote} onClose={() => setIsAddingNote(false)} noteToEdit={noteToEdit} />}
    </div>
  );
};

export default CreateJar;