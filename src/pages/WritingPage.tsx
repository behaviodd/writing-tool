import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useProject } from '../hooks/useProject';
import { useAutoSave } from '../hooks/useAutoSave';
import { useAuth } from '../contexts/AuthContext';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { DraftPanel } from '../components/DraftPanel/DraftPanel';
import { ManuscriptPanel } from '../components/ManuscriptPanel/ManuscriptPanel';
import { Editor } from '../components/Editor/Editor';
import { BundleCreateModal } from '../components/BundleCreateModal/BundleCreateModal';
import { FormatSidebar } from '../components/FormatSidebar/FormatSidebar';
import { ConfirmModal } from '../components/ConfirmModal/ConfirmModal';
import { PreviewModal } from '../components/PreviewModal/PreviewModal';
import { HelpModal } from '../components/HelpModal/HelpModal';
import type { Bundle, FormattingOptions } from '../types';
import './WritingPage.css';

export const WritingPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFormatSidebar, setShowFormatSidebar] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeBundle, setActiveBundle] = useState<Bundle | null>(null);
  const [overContainer, setOverContainer] = useState<string | null>(null);
  const [bundleToDelete, setBundleToDelete] = useState<string | null>(null);

  const {
    project,
    updateProject,
    addBundleWithTitle,
    updateBundle,
    deleteBundle,
    reorderBundles,
    moveBundleBetweenContainers,
    addFragment,
    updateFragment,
    deleteFragment,
    setCurrentBundle,
    setCurrentFragment,
    getCurrentBundle,
    getCurrentFragment,
    loadProjectById,
  } = useProject();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useAutoSave(project, 30000, user?.uid);

  useEffect(() => {
    if (projectId) {
      const loaded = loadProjectById(projectId);
      if (!loaded) {
        navigate('/');
      }
    }
  }, [projectId]);

  const currentBundle = getCurrentBundle();
  const currentFragment = getCurrentFragment();

  // Determine which container the current bundle is in
  const getBundleLocation = (): 'drafts' | 'manuscript' | null => {
    if (!currentBundle || !project) return null;
    if (project.drafts.some(b => b.id === currentBundle.id)) return 'drafts';
    if (project.manuscript.some(b => b.id === currentBundle.id)) return 'manuscript';
    return null;
  };
  const bundleLocation = getBundleLocation();

  const handleUpdateBundleTitle = (bundleId: string, title: string) => {
    updateBundle(bundleId, { title });
  };

  const handleUpdateFormatting = (formatting: FormattingOptions) => {
    if (currentBundle) {
      updateBundle(currentBundle.id, { formatting });
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleCreateBundle = (title: string) => {
    addBundleWithTitle(title, true);
    setShowCreateModal(false);
  };

  const handleDeleteBundle = (bundleId: string) => {
    setBundleToDelete(bundleId);
  };

  const confirmDeleteBundle = () => {
    if (bundleToDelete) {
      deleteBundle(bundleToDelete);
      setBundleToDelete(null);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const bundleId = active.id as string;
    const bundle =
      project?.drafts.find(b => b.id === bundleId) ||
      project?.manuscript.find(b => b.id === bundleId);
    setActiveBundle(bundle || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overId = over.id as string;
      if (overId === 'drafts' || overId === 'manuscript') {
        setOverContainer(overId);
      } else {
        // Check if over a bundle in drafts or manuscript
        const inDrafts = project?.drafts.some(b => b.id === overId);
        const inManuscript = project?.manuscript.some(b => b.id === overId);
        if (inDrafts) setOverContainer('drafts');
        else if (inManuscript) setOverContainer('manuscript');
      }
    } else {
      setOverContainer(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBundle(null);
    setOverContainer(null);

    if (!over || !project) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which container the active item is from
    const fromDrafts = project.drafts.some(b => b.id === activeId);

    // Determine target container
    let toContainer: 'drafts' | 'manuscript' | null = null;
    if (overId === 'drafts' || overId === 'manuscript') {
      toContainer = overId;
    } else {
      const toDrafts = project.drafts.some(b => b.id === overId);
      const toManuscript = project.manuscript.some(b => b.id === overId);
      if (toDrafts) toContainer = 'drafts';
      else if (toManuscript) toContainer = 'manuscript';
    }

    if (!toContainer) return;

    const fromContainer = fromDrafts ? 'drafts' : 'manuscript';

    if (fromContainer === toContainer) {
      // Same container - reorder
      const items = fromContainer === 'drafts' ? project.drafts : project.manuscript;
      const oldIndex = items.findIndex(b => b.id === activeId);
      let newIndex = items.findIndex(b => b.id === overId);

      if (overId === 'drafts' || overId === 'manuscript') {
        newIndex = items.length;
      }

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        reorderBundles(fromContainer, oldIndex, newIndex);
      }
    } else {
      // Different container - move between
      moveBundleBetweenContainers(activeId, fromContainer, toContainer);
    }
  };

  if (!project) {
    return null;
  }

  return (
    <div className="writing-page">
      <Toolbar
        project={project}
        onUpdateProjectName={(name) => updateProject({ name })}
        onGoBack={handleGoBack}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <main className="main-content">
          <div className="panel draft-section">
            <DraftPanel
              bundles={project.drafts}
              currentBundleId={project.currentBundleId}
              onSelectBundle={setCurrentBundle}
              onDeleteBundle={handleDeleteBundle}
              onAddBundle={() => setShowCreateModal(true)}
              onShowHelp={() => setShowHelpModal(true)}
              isDropTarget={overContainer === 'drafts'}
            />
          </div>

          <div className="panel editor-section">
            <Editor
              bundle={currentBundle}
              currentFragment={currentFragment}
              bundleLocation={bundleLocation}
              onUpdateFragment={updateFragment}
              onAddFragment={addFragment}
              onDeleteFragment={deleteFragment}
              onSelectFragment={setCurrentFragment}
              onUpdateBundleTitle={handleUpdateBundleTitle}
            />
          </div>

          <div className="panel manuscript-section">
            <ManuscriptPanel
              bundles={project.manuscript}
              currentBundleId={project.currentBundleId}
              onSelectBundle={setCurrentBundle}
              onDeleteBundle={handleDeleteBundle}
              onToggleFormat={() => setShowFormatSidebar(!showFormatSidebar)}
              onOpenPreview={() => setShowPreviewModal(true)}
              showFormatSidebar={showFormatSidebar}
              isDropTarget={overContainer === 'manuscript'}
            />
          </div>
        </main>

        <DragOverlay>
          {activeBundle && (
            <div className="drag-overlay-bundle">
              <span className="drag-overlay-title">{activeBundle.title}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showFormatSidebar && currentBundle && (
        <FormatSidebar
          formatting={currentBundle.formatting}
          onChange={handleUpdateFormatting}
          onClose={() => setShowFormatSidebar(false)}
        />
      )}

      {showCreateModal && (
        <BundleCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBundle}
        />
      )}

      {bundleToDelete && (
        <ConfirmModal
          message="글 묶음을 삭제하시겠습니까?"
          confirmLabel="삭제"
          cancelLabel="취소"
          onConfirm={confirmDeleteBundle}
          onCancel={() => setBundleToDelete(null)}
        />
      )}

      {showPreviewModal && (
        <PreviewModal
          bundles={project.manuscript}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
};
