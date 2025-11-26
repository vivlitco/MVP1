import { Jar } from '../types';
import { API } from './api';

// Helper to get current user ID from session
const getCurrentUserId = (): string | null => {
    const userJson = sessionStorage.getItem('vivlit_session_user');
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    return user.id;
};

const getHeaders = (userId?: string) => {
    const id = userId || getCurrentUserId();
    return {
        'Content-Type': 'application/json',
        'x-user-id': id || '', // Send user ID in header for MVP auth
    };
};

export const getJarsForUser = async (userId: string): Promise<Jar[]> => {
    try {
        const response = await fetch(API.JARS.BASE, {
            headers: getHeaders(userId),
        });
        if (!response.ok) throw new Error('Failed to fetch jars');
        const jars = await response.json();
        return jars.map((jar: any) => ({ ...jar, id: jar._id }));
    } catch (error) {
        console.error("Error fetching jars:", error);
        return [];
    }
};

export const saveJarForUser = async (userId: string, jarToSave: Jar): Promise<Jar[]> => {
    try {
        // If it's a temp ID (starts with jar-), remove it so Mongo generates one
        // OR let the backend handle it.
        // The backend expects the full object.

        const response = await fetch(API.JARS.BASE, {
            method: 'POST',
            headers: getHeaders(userId),
            body: JSON.stringify(jarToSave),
        });

        if (!response.ok) throw new Error('Failed to save jar');

        // After saving, re-fetch all jars to ensure state is synced
        return await getJarsForUser(userId);
    } catch (error) {
        console.error("Error saving jar:", error);
        throw error;
    }
};

export const deleteJarForUser = async (userId: string, jarIdToDelete: string): Promise<Jar[]> => {
    try {
        const response = await fetch(`${API.JARS.BASE}/${jarIdToDelete}`, {
            method: 'DELETE',
            headers: getHeaders(userId),
        });

        if (!response.ok) throw new Error('Failed to delete jar');

        return await getJarsForUser(userId);
    } catch (error) {
        console.error("Error deleting jar:", error);
        throw error;
    }
};

export const getSharedJar = async (jarId: string): Promise<Jar | null> => {
    try {
        const response = await fetch(API.JARS.SHARED(jarId));
        if (!response.ok) return null;
        const jar = await response.json();
        return { ...jar, id: jar._id };
    } catch (error) {
        console.error("Error fetching shared jar:", error);
        return null;
    }
};
