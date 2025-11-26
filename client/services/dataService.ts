import { Jar, JarDirection, NoteType } from '../types';

// In a real app, this would be a secure backend. For this demo, we use localStorage.
const JARS_KEY_PREFIX = 'vivlit_jars_';
const ALL_JARS_KEY = 'vivlit_all_jars'; // For shared view lookup

// Mock Data for new users
const initialJarsForNewUser: Jar[] = [
    {
        id: 'jar-1',
        name: "For My Bestie",
        coverNote: "A collection of happy moments, just for you. Open them when you need a smile!",
        notes: [
            { id: 'note-1', type: NoteType.TEXT, content: 'Remember that time we tried to bake a cake and it exploded? Funniest day ever! 😂' },
            { id: 'note-2', type: NoteType.TEXT, content: 'You are the kindest person I know. Never forget that.' },
        ],
        senderName: 'Your Name', // Will be replaced by current user's name
        recipientName: 'Alex Smith',
        sentDate: '2024-07-15T10:00:00Z',
        direction: JarDirection.SENT,
    },
    {
        id: 'jar-2',
        name: "From Mom",
        coverNote: "A little box of memories from your childhood.",
        notes: [],
        senderName: 'Mom',
        recipientName: 'Your Name', // Will be replaced by current user's name
        sentDate: '2024-07-10T15:30:00Z',
        openedDate: '2024-07-11T09:00:00Z',
        direction: JarDirection.RECEIVED,
    },
];

// Helper to update the global jar list for sharing
const updateAllJars = (userJars: Jar[]) => {
    const allJarsJson = localStorage.getItem(ALL_JARS_KEY);
    let allJars = allJarsJson ? JSON.parse(allJarsJson) : {};

    // Assuming jars have unique IDs across users for this demo
    userJars.forEach(jar => {
        allJars[jar.id] = jar;
    });

    localStorage.setItem(ALL_JARS_KEY, JSON.stringify(allJars));
};

const removeJarsFromAll = (jarIds: string[]) => {
    const allJarsJson = localStorage.getItem(ALL_JARS_KEY);
    if (!allJarsJson) return;
    let allJars = JSON.parse(allJarsJson);
    jarIds.forEach(id => {
        delete allJars[id];
    });
     localStorage.setItem(ALL_JARS_KEY, JSON.stringify(allJars));
}

export const getJarsForUser = (userId: string): Jar[] => {
    const userJarsKey = `${JARS_KEY_PREFIX}${userId}`;
    const jarsJson = localStorage.getItem(userJarsKey);
    if (jarsJson) {
        return JSON.parse(jarsJson);
    }
    
    // If no jars, create initial set for demo purposes
    const newJars = initialJarsForNewUser.map(j => ({...j, id: `${j.id}-${Date.now()}`}));
    localStorage.setItem(userJarsKey, JSON.stringify(newJars));
    updateAllJars(newJars);
    return newJars;
};

export const saveJarForUser = (userId: string, jarToSave: Jar): Jar[] => {
    const userJarsKey = `${JARS_KEY_PREFIX}${userId}`;
    let jars = getJarsForUser(userId);
    
    const isEditing = jars.some(j => j.id === jarToSave.id);
    if (isEditing) {
        jars = jars.map(j => (j.id === jarToSave.id ? jarToSave : j));
    } else {
        jars = [jarToSave, ...jars];
    }

    localStorage.setItem(userJarsKey, JSON.stringify(jars));
    updateAllJars([jarToSave]); // Update the global list
    return jars;
};


export const deleteJarForUser = (userId: string, jarIdToDelete: string): Jar[] => {
    const userJarsKey = `${JARS_KEY_PREFIX}${userId}`;
    let jars = getJarsForUser(userId);
    const updatedJars = jars.filter(j => j.id !== jarIdToDelete);
    
    localStorage.setItem(userJarsKey, JSON.stringify(updatedJars));
    removeJarsFromAll([jarIdToDelete]); // Remove from the global list
    return updatedJars;
};


export const getSharedJar = (jarId: string): Jar | null => {
    const allJarsJson = localStorage.getItem(ALL_JARS_KEY);
    if (!allJarsJson) return null;
    
    const allJars = JSON.parse(allJarsJson);
    return allJars[jarId] || null;
}
