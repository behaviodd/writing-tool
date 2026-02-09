import { useEffect, useRef } from 'react';
import type { Project } from '../types';
import { saveProject } from '../utils/storage';

export const useAutoSave = (
  project: Project | null,
  interval: number = 30000,
  userId?: string
) => {
  const projectRef = useRef(project);
  const userIdRef = useRef(userId);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (projectRef.current) {
        saveProject(projectRef.current, userIdRef.current);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (projectRef.current) {
        saveProject(projectRef.current, userIdRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
};
