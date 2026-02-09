import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Project, AppState, ProjectMeta } from '../types';
import { getProjectMeta } from '../types';

const APP_STATE_KEY = 'writing-tool-state';
const PROJECT_PREFIX = 'writing-tool-project-';

// Local Storage Functions
export const getAppState = (): AppState => {
  try {
    const data = localStorage.getItem(APP_STATE_KEY);
    if (data) {
      return JSON.parse(data) as AppState;
    }
  } catch (error) {
    console.error('Failed to load app state:', error);
  }
  return {
    projects: [],
    currentProjectId: null,
    lastSyncedAt: Date.now(),
  };
};

export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
};

export const saveProject = (project: Project, userId?: string): void => {
  try {
    localStorage.setItem(PROJECT_PREFIX + project.id, JSON.stringify(project));

    const state = getAppState();
    const meta = getProjectMeta(project);
    const existingIndex = state.projects.findIndex((p) => p.id === project.id);

    if (existingIndex >= 0) {
      state.projects[existingIndex] = meta;
    } else {
      state.projects.push(meta);
    }

    state.lastSyncedAt = Date.now();
    saveAppState(state);

    // Sync to Firestore if user is logged in
    if (userId) {
      syncProjectToFirestore(userId, project).catch(console.error);
    }
  } catch (error) {
    console.error('Failed to save project:', error);
  }
};

export const loadProject = (projectId: string): Project | null => {
  try {
    const data = localStorage.getItem(PROJECT_PREFIX + projectId);
    if (data) {
      return JSON.parse(data) as Project;
    }
  } catch (error) {
    console.error('Failed to load project:', error);
  }
  return null;
};

export const deleteProject = (projectId: string, userId?: string): void => {
  try {
    localStorage.removeItem(PROJECT_PREFIX + projectId);

    const state = getAppState();
    state.projects = state.projects.filter((p) => p.id !== projectId);
    if (state.currentProjectId === projectId) {
      state.currentProjectId = null;
    }
    state.lastSyncedAt = Date.now();
    saveAppState(state);

    // Delete from Firestore if user is logged in
    if (userId) {
      deleteProjectFromFirestore(userId, projectId).catch(console.error);
    }
  } catch (error) {
    console.error('Failed to delete project:', error);
  }
};

export const getAllProjects = (): ProjectMeta[] => {
  const state = getAppState();
  return state.projects.sort((a, b) => b.updatedAt - a.updatedAt);
};

export const importProjectFromJson = (file: File): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string) as Project;
        project.id = crypto.randomUUID();
        project.updatedAt = Date.now();
        resolve(project);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const setCurrentProjectId = (projectId: string | null): void => {
  const state = getAppState();
  state.currentProjectId = projectId;
  saveAppState(state);
};

export const getCurrentProjectId = (): string | null => {
  return getAppState().currentProjectId;
};

// Firestore Sync Functions
export const syncProjectToFirestore = async (
  userId: string,
  project: Project
): Promise<void> => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', project.id);
    await setDoc(projectRef, {
      ...project,
      syncedAt: Date.now(),
    });
  } catch (error) {
    console.error('Failed to sync project to Firestore:', error);
  }
};

export const deleteProjectFromFirestore = async (
  userId: string,
  projectId: string
): Promise<void> => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Failed to delete project from Firestore:', error);
  }
};

export const loadProjectsFromFirestore = async (
  userId: string
): Promise<Project[]> => {
  try {
    const projectsRef = collection(db, 'users', userId, 'projects');
    const q = query(projectsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Project);
  } catch (error) {
    console.error('Failed to load projects from Firestore:', error);
    return [];
  }
};

export const syncFromFirestore = async (userId: string): Promise<void> => {
  try {
    const firestoreProjects = await loadProjectsFromFirestore(userId);
    const firestoreIds = new Set(firestoreProjects.map((p) => p.id));

    for (const project of firestoreProjects) {
      const localProject = loadProject(project.id);

      // If local doesn't exist or Firestore is newer, use Firestore version
      if (!localProject || project.updatedAt > localProject.updatedAt) {
        localStorage.setItem(PROJECT_PREFIX + project.id, JSON.stringify(project));
      }
    }

    // Update app state with all projects
    const state = getAppState();
    const allProjectIds = new Set([
      ...state.projects.map((p) => p.id),
      ...firestoreProjects.map((p) => p.id),
    ]);

    // Push local-only projects to Firestore
    for (const id of allProjectIds) {
      if (!firestoreIds.has(id)) {
        const localProject = loadProject(id);
        if (localProject) {
          syncProjectToFirestore(userId, localProject).catch(console.error);
        }
      }
    }

    state.projects = [];
    for (const id of allProjectIds) {
      const project = loadProject(id);
      if (project) {
        state.projects.push(getProjectMeta(project));
      }
    }

    state.lastSyncedAt = Date.now();
    saveAppState(state);
  } catch (error) {
    console.error('Failed to sync from Firestore:', error);
  }
};
