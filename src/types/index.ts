export interface FormattingOptions {
  fontSize: number;
  lineHeight: number;
  indent: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  paragraphSpacing: number;
}

export interface Bundle {
  id: string;
  title: string;
  content: string;
  formatting: FormattingOptions;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  drafts: Bundle[];
  manuscript: Bundle[];
  currentBundleId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  totalBundles: number;
  totalCharacters: number;
}

export interface AppState {
  projects: ProjectMeta[];
  currentProjectId: string | null;
  lastSyncedAt: number;
}

export const defaultFormatting: FormattingOptions = {
  fontSize: 14,
  lineHeight: 1.8,
  indent: 20,
  bold: false,
  italic: false,
  underline: false,
  paragraphSpacing: 12,
};

export const createBundle = (title: string = '새 글 묶음'): Bundle => ({
  id: crypto.randomUUID(),
  title,
  content: '',
  formatting: { ...defaultFormatting },
  createdAt: Date.now(),
});

export const createProject = (name: string = '새 프로젝트'): Project => ({
  id: crypto.randomUUID(),
  name,
  drafts: [],
  manuscript: [],
  currentBundleId: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const getProjectMeta = (project: Project): ProjectMeta => {
  const totalBundles = project.drafts.length + project.manuscript.length;
  const temp = document.createElement('div');
  const totalCharacters = [...project.drafts, ...project.manuscript].reduce(
    (total, bundle) => {
      temp.innerHTML = bundle.content;
      return total + (temp.textContent?.length || 0);
    },
    0
  );

  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    totalBundles,
    totalCharacters,
  };
};
