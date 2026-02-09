import { useState, useCallback } from 'react';
import type { Project, Bundle, TextFragment } from '../types';
import { createBundle, createTextFragment } from '../types';
import { saveProject, loadProject } from '../utils/storage';

export const useProject = () => {
  const [project, setProject] = useState<Project | null>(null);

  const updateProject = useCallback((updates: Partial<Project>) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates, updatedAt: Date.now() };
      saveProject(updated);
      return updated;
    });
  }, []);

  const loadProjectById = useCallback((projectId: string): boolean => {
    const loaded = loadProject(projectId);
    if (loaded) {
      setProject(loaded);
      return true;
    }
    return false;
  }, []);

  const addBundle = useCallback(
    (toDraft: boolean = true) => {
      if (!project) return null;
      const newBundle = createBundle();
      if (toDraft) {
        updateProject({
          drafts: [...project.drafts, newBundle],
          currentBundleId: newBundle.id,
          currentFragmentId: newBundle.fragments[0]?.id || null,
        });
      } else {
        updateProject({
          manuscript: [...project.manuscript, newBundle],
          currentBundleId: newBundle.id,
          currentFragmentId: newBundle.fragments[0]?.id || null,
        });
      }
      return newBundle;
    },
    [project, updateProject]
  );

  const addBundleWithTitle = useCallback(
    (title: string, toDraft: boolean = true) => {
      if (!project) return null;
      const newBundle = createBundle(title);
      if (toDraft) {
        updateProject({
          drafts: [...project.drafts, newBundle],
          currentBundleId: newBundle.id,
          currentFragmentId: newBundle.fragments[0]?.id || null,
        });
      } else {
        updateProject({
          manuscript: [...project.manuscript, newBundle],
          currentBundleId: newBundle.id,
          currentFragmentId: newBundle.fragments[0]?.id || null,
        });
      }
      return newBundle;
    },
    [project, updateProject]
  );

  const updateBundle = useCallback(
    (bundleId: string, updates: Partial<Bundle>) => {
      if (!project) return;
      const updateBundles = (bundles: Bundle[]) =>
        bundles.map((b) => (b.id === bundleId ? { ...b, ...updates } : b));

      updateProject({
        drafts: updateBundles(project.drafts),
        manuscript: updateBundles(project.manuscript),
      });
    },
    [project, updateProject]
  );

  const deleteBundle = useCallback(
    (bundleId: string) => {
      if (!project) return;
      updateProject({
        drafts: project.drafts.filter((b) => b.id !== bundleId),
        manuscript: project.manuscript.filter((b) => b.id !== bundleId),
        currentBundleId:
          project.currentBundleId === bundleId ? null : project.currentBundleId,
        currentFragmentId:
          project.currentBundleId === bundleId
            ? null
            : project.currentFragmentId,
      });
    },
    [project, updateProject]
  );

  const moveBundleToManuscript = useCallback(
    (bundleId: string) => {
      if (!project) return;
      const bundle = project.drafts.find((b) => b.id === bundleId);
      if (bundle) {
        updateProject({
          drafts: project.drafts.filter((b) => b.id !== bundleId),
          manuscript: [...project.manuscript, bundle],
        });
      }
    },
    [project, updateProject]
  );

  const moveBundleToDraft = useCallback(
    (bundleId: string) => {
      if (!project) return;
      const bundle = project.manuscript.find((b) => b.id === bundleId);
      if (bundle) {
        updateProject({
          manuscript: project.manuscript.filter((b) => b.id !== bundleId),
          drafts: [...project.drafts, bundle],
        });
      }
    },
    [project, updateProject]
  );

  const moveBundleBetweenContainers = useCallback(
    (bundleId: string, from: 'drafts' | 'manuscript', to: 'drafts' | 'manuscript') => {
      if (!project || from === to) return;

      const sourceList = from === 'drafts' ? project.drafts : project.manuscript;
      const bundle = sourceList.find((b) => b.id === bundleId);

      if (!bundle) return;

      const newDrafts = from === 'drafts'
        ? project.drafts.filter((b) => b.id !== bundleId)
        : to === 'drafts'
          ? [...project.drafts, bundle]
          : project.drafts;

      const newManuscript = from === 'manuscript'
        ? project.manuscript.filter((b) => b.id !== bundleId)
        : to === 'manuscript'
          ? [...project.manuscript, bundle]
          : project.manuscript;

      updateProject({
        drafts: newDrafts,
        manuscript: newManuscript,
      });
    },
    [project, updateProject]
  );

  const reorderBundles = useCallback(
    (type: 'drafts' | 'manuscript', oldIndex: number, newIndex: number) => {
      if (!project) return;
      const bundles =
        type === 'drafts' ? [...project.drafts] : [...project.manuscript];
      const [removed] = bundles.splice(oldIndex, 1);
      bundles.splice(newIndex, 0, removed);

      updateProject({
        [type]: bundles,
      });
    },
    [project, updateProject]
  );

  const addFragment = useCallback(
    (bundleId: string) => {
      if (!project) return null;
      const newFragment = createTextFragment();
      const updateBundles = (bundles: Bundle[]) =>
        bundles.map((b) =>
          b.id === bundleId
            ? { ...b, fragments: [...b.fragments, newFragment] }
            : b
        );

      updateProject({
        drafts: updateBundles(project.drafts),
        manuscript: updateBundles(project.manuscript),
        currentFragmentId: newFragment.id,
      });
      return newFragment;
    },
    [project, updateProject]
  );

  const updateFragment = useCallback(
    (bundleId: string, fragmentId: string, content: string) => {
      if (!project) return;
      const updateBundles = (bundles: Bundle[]) =>
        bundles.map((b) =>
          b.id === bundleId
            ? {
                ...b,
                fragments: b.fragments.map((f) =>
                  f.id === fragmentId
                    ? { ...f, content, updatedAt: Date.now() }
                    : f
                ),
              }
            : b
        );

      updateProject({
        drafts: updateBundles(project.drafts),
        manuscript: updateBundles(project.manuscript),
      });
    },
    [project, updateProject]
  );

  const deleteFragment = useCallback(
    (bundleId: string, fragmentId: string) => {
      if (!project) return;
      const updateBundles = (bundles: Bundle[]) =>
        bundles.map((b) =>
          b.id === bundleId
            ? { ...b, fragments: b.fragments.filter((f) => f.id !== fragmentId) }
            : b
        );

      updateProject({
        drafts: updateBundles(project.drafts),
        manuscript: updateBundles(project.manuscript),
        currentFragmentId:
          project.currentFragmentId === fragmentId
            ? null
            : project.currentFragmentId,
      });
    },
    [project, updateProject]
  );

  const reorderFragments = useCallback(
    (bundleId: string, oldIndex: number, newIndex: number) => {
      if (!project) return;
      const updateBundles = (bundles: Bundle[]) =>
        bundles.map((b) => {
          if (b.id !== bundleId) return b;
          const fragments = [...b.fragments];
          const [removed] = fragments.splice(oldIndex, 1);
          fragments.splice(newIndex, 0, removed);
          return { ...b, fragments };
        });

      updateProject({
        drafts: updateBundles(project.drafts),
        manuscript: updateBundles(project.manuscript),
      });
    },
    [project, updateProject]
  );

  const setCurrentBundle = useCallback(
    (bundleId: string | null) => {
      if (!project) return;
      let fragmentId: string | null = null;
      if (bundleId) {
        const bundle =
          project.drafts.find((b) => b.id === bundleId) ||
          project.manuscript.find((b) => b.id === bundleId);
        fragmentId = bundle?.fragments[0]?.id || null;
      }
      updateProject({
        currentBundleId: bundleId,
        currentFragmentId: fragmentId,
      });
    },
    [project, updateProject]
  );

  const setCurrentFragment = useCallback(
    (fragmentId: string | null) => {
      updateProject({ currentFragmentId: fragmentId });
    },
    [updateProject]
  );

  const getCurrentBundle = useCallback((): Bundle | null => {
    if (!project || !project.currentBundleId) return null;
    return (
      project.drafts.find((b) => b.id === project.currentBundleId) ||
      project.manuscript.find((b) => b.id === project.currentBundleId) ||
      null
    );
  }, [project]);

  const getCurrentFragment = useCallback((): TextFragment | null => {
    const bundle = getCurrentBundle();
    if (!bundle || !project?.currentFragmentId) return null;
    return (
      bundle.fragments.find((f) => f.id === project.currentFragmentId) || null
    );
  }, [project, getCurrentBundle]);

  return {
    project,
    updateProject,
    loadProjectById,
    addBundle,
    addBundleWithTitle,
    updateBundle,
    deleteBundle,
    moveBundleToManuscript,
    moveBundleToDraft,
    moveBundleBetweenContainers,
    reorderBundles,
    addFragment,
    updateFragment,
    deleteFragment,
    reorderFragments,
    setCurrentBundle,
    setCurrentFragment,
    getCurrentBundle,
    getCurrentFragment,
  };
};
