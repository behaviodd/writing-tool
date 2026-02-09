import { useCallback, useEffect, useRef, useState } from 'react';
import type { Project } from '../types';
import { saveProject } from '../utils/storage';

export const useAutoSave = (
  project: Project | null,
  interval: number = 30000,
  userId?: string
) => {
  const projectRef = useRef(project);
  const userIdRef = useRef(userId);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const save = useCallback(() => {
    if (projectRef.current) {
      saveProject(projectRef.current, userIdRef.current);
      setLastSavedAt(Date.now());
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      save();
    }, interval);

    return () => clearInterval(timer);
  }, [interval, save]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (projectRef.current) {
        saveProject(projectRef.current, userIdRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return { save, lastSavedAt };
};
