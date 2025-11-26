export enum NoteType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
}

export interface Note {
  id: string;
  type: NoteType;
  content: string; // For TEXT, it's the text. For others, it's a data URL.
  fileName?: string; // For file-based notes
}

export enum JarDirection {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
}

export interface Jar {
  id: string;
  name: string;
  coverNote: string;
  notes: Note[];
  // New fields for Memory Lane
  senderName: string; // e.g., "Jane Doe" (the current user)
  recipientName: string; // e.g., "Alex Smith"
  sentDate: string; // ISO String for sorting
  openedDate?: string; // ISO String, optional
  direction: JarDirection; // Is it sent or received from the user's perspective?
}

export interface User {
  id: string; // user's email
  name: string;
  avatarUrl: string;
  email: string;
}
