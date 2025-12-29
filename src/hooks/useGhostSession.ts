import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const GHOST_SESSION_KEY = 'vivlit_ghost_session';

export const useGhostSession = () => {
  const { user } = useAuth();
  const [ghostSessionId, setGhostSessionId] = useState<string | null>(() => {
    // Initialize from localStorage synchronously to avoid hydration issues
    if (typeof window !== 'undefined' && !user) {
      return localStorage.getItem(GHOST_SESSION_KEY);
    }
    return null;
  });
  const isConvertingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      // Not logged in - ensure we have a ghost session
      let sessionId = localStorage.getItem(GHOST_SESSION_KEY);
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem(GHOST_SESSION_KEY, sessionId);
      }
      setGhostSessionId(sessionId);
    } else {
      // User is logged in, check if we need to convert ghost account
      const sessionId = localStorage.getItem(GHOST_SESSION_KEY);
      if (sessionId && !isConvertingRef.current) {
        isConvertingRef.current = true;
        convertGhostAccount(sessionId, user.id).finally(() => {
          isConvertingRef.current = false;
        });
      }
      setGhostSessionId(null);
    }
  }, [user]);

  const convertGhostAccount = async (sessionId: string, userId: string) => {
    try {
      const { error } = await supabase.rpc('convert_ghost_account', {
        p_session_id: sessionId,
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

      localStorage.removeItem(GHOST_SESSION_KEY);
    } catch (error) {
      console.error('Failed to convert ghost account:', error);
    }
  };

  const createGhostRecord = useCallback(async () => {
    const currentSessionId = localStorage.getItem(GHOST_SESSION_KEY);
    if (!currentSessionId) return null;
    
    try {
      // Check if record already exists
      const { data: existing } = await supabase
        .from('ghost_accounts')
        .select('*')
        .eq('session_id', currentSessionId)
        .maybeSingle();
      
      if (existing) return existing;
      
      const { data, error } = await supabase
        .from('ghost_accounts')
        .insert({ session_id: currentSessionId })
        .select()
        .single();
      
      if (error) {
        // If unique constraint violation, record already exists
        if (error.code === '23505') {
          const { data: existingData } = await supabase
            .from('ghost_accounts')
            .select('*')
            .eq('session_id', currentSessionId)
            .maybeSingle();
          return existingData;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Failed to create ghost record:', error);
      return null;
    }
  }, []);

  const getGhostSessionId = useCallback(() => {
    return localStorage.getItem(GHOST_SESSION_KEY);
  }, []);

  return {
    ghostSessionId,
    isGhost: !user && !!ghostSessionId,
    createGhostRecord,
    getGhostSessionId,
  };
};
