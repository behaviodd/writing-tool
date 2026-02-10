import { useEffect, useState, useCallback } from 'react';
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
import { ConfirmModal } from '../components/ConfirmModal/ConfirmModal';
import { PreviewModal } from '../components/PreviewModal/PreviewModal';
import { HelpModal } from '../components/HelpModal/HelpModal';
import { Icon } from '../components/Icon/Icon';
import type { Bundle } from '../types';
import './WritingPage.css';

type MobileTab = 'drafts' | 'editor' | 'manuscript';

export const WritingPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeBundle, setActiveBundle] = useState<Bundle | null>(null);
  const [overContainer, setOverContainer] = useState<string | null>(null);
  const [bundleToDelete, setBundleToDelete] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');

  const {
    project,
    updateProject,
    addBundleWithTitle,
    updateBundle,
    deleteBundle,
    reorderBundles,
    moveBundleBetweenContainers,
    moveBundleToManuscript,
    moveBundleToDraft,
    updateBundleContent,
    setCurrentBundle,
    getCurrentBundle,
    loadProjectById,
  } = useProject();

  const handleMobileSelectBundle = useCallback((bundleId: string) => {
    setCurrentBundle(bundleId);
    setMobileTab('editor');
  }, [setCurrentBundle]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const { save } = useAutoSave(project, 30000, user?.uid);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (projectId && user) {
      const loaded = loadProjectById(projectId);
      if (!loaded) {
        navigate('/');
      }
    }
  }, [projectId, user]);

  const currentBundle = getCurrentBundle();

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

    const fromDrafts = project.drafts.some(b => b.id === activeId);

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
      moveBundleBetweenContainers(activeId, fromContainer, toContainer);
    }
  };

  if (loading || !user || !project) {
    return null;
  }

  return (
    <div className="writing-page">
      <Toolbar
        project={project}
        onUpdateProjectName={(name) => updateProject({ name })}
        onGoBack={handleGoBack}
        onSave={save}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <main className="main-content">
          <div className={`panel draft-section mobile-tab-panel ${mobileTab === 'drafts' ? 'mobile-active' : ''}`}>
            <DraftPanel
              bundles={project.drafts}
              currentBundleId={project.currentBundleId}
              onSelectBundle={handleMobileSelectBundle}
              onDeleteBundle={handleDeleteBundle}
              onAddBundle={() => setShowCreateModal(true)}
              onShowHelp={() => setShowHelpModal(true)}
              isDropTarget={overContainer === 'drafts'}
            />
          </div>

          <div className={`panel editor-section mobile-tab-panel ${mobileTab === 'editor' ? 'mobile-active' : ''}`}>
            <Editor
              bundle={currentBundle}
              bundleLocation={bundleLocation}
              onUpdateContent={updateBundleContent}
              onUpdateBundleTitle={handleUpdateBundleTitle}
              onToggleLocation={() => {
                if (!currentBundle) return;
                if (bundleLocation === 'drafts') {
                  moveBundleToManuscript(currentBundle.id);
                } else if (bundleLocation === 'manuscript') {
                  moveBundleToDraft(currentBundle.id);
                }
              }}
            />
          </div>

          <div className={`panel manuscript-section mobile-tab-panel ${mobileTab === 'manuscript' ? 'mobile-active' : ''}`}>
            <ManuscriptPanel
              bundles={project.manuscript}
              currentBundleId={project.currentBundleId}
              onSelectBundle={handleMobileSelectBundle}
              onDeleteBundle={handleDeleteBundle}
              onReorderBundle={(oldIndex, newIndex) => reorderBundles('manuscript', oldIndex, newIndex)}
              onOpenPreview={() => setShowPreviewModal(true)}
              isDropTarget={overContainer === 'manuscript'}
            />
          </div>
        </main>

        <nav className="mobile-tab-bar">
          <button
            className={`mobile-tab ${mobileTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setMobileTab('drafts')}
          >
            <Icon name="edit_note" size={22} />
            <span>초안</span>
            {project.drafts.length > 0 && (
              <span className="mobile-tab-badge">{project.drafts.length}</span>
            )}
          </button>
          <button
            className={`mobile-tab ${mobileTab === 'editor' ? 'active' : ''}`}
            onClick={() => setMobileTab('editor')}
          >
            <Icon name="edit_document" size={22} />
            <span>에디터</span>
          </button>
          <button
            className={`mobile-tab ${mobileTab === 'manuscript' ? 'active' : ''}`}
            onClick={() => setMobileTab('manuscript')}
          >
            <Icon name="article" size={22} />
            <span>원고</span>
            {project.manuscript.length > 0 && (
              <span className="mobile-tab-badge">{project.manuscript.length}</span>
            )}
          </button>
        </nav>

        <DragOverlay>
          {activeBundle && (
            <div className="drag-overlay-bundle">
              <span className="drag-overlay-title">{activeBundle.title}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

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
