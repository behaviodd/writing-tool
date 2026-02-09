import { useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type { Bundle, TextFragment } from '../../types';
import { Icon } from '../Icon/Icon';
import { RichTextEditor, countHtmlCharacters } from '../RichTextEditor/RichTextEditor';
import './Editor.css';

interface EditorProps {
  bundle: Bundle | null;
  currentFragment: TextFragment | null;
  bundleLocation: 'drafts' | 'manuscript' | null;
  onUpdateFragment: (bundleId: string, fragmentId: string, content: string) => void;
  onAddFragment: (bundleId: string) => void;
  onDeleteFragment: (bundleId: string, fragmentId: string) => void;
  onSelectFragment: (fragmentId: string) => void;
  onUpdateBundleTitle: (bundleId: string, title: string) => void;
  onReorderFragment: (bundleId: string, oldIndex: number, newIndex: number) => void;
  onToggleLocation?: () => void;
  onMobileBack?: () => void;
}

const SortableFragmentTab = ({
  fragment,
  index,
  isActive,
  canDelete,
  onSelect,
  onDelete,
}: {
  fragment: TextFragment;
  index: number;
  isActive: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fragment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`fragment-tab ${isActive ? 'active' : ''}`}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <span>조각 {index + 1}</span>
      {canDelete && (
        <span
          className="delete-fragment"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Icon name="close" size={14} />
        </span>
      )}
    </button>
  );
};

export const Editor = ({
  bundle,
  currentFragment,
  bundleLocation,
  onUpdateFragment,
  onAddFragment,
  onDeleteFragment,
  onSelectFragment,
  onUpdateBundleTitle,
  onReorderFragment,
  onToggleLocation,
  onMobileBack,
}: EditorProps) => {
  const [draggingFragmentId, setDraggingFragmentId] = useState<string | null>(null);

  const fragmentSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleContentChange = useCallback(
    (content: string) => {
      if (bundle && currentFragment) {
        onUpdateFragment(bundle.id, currentFragment.id, content);
      }
    },
    [bundle, currentFragment, onUpdateFragment]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (bundle) {
        onUpdateBundleTitle(bundle.id, e.target.value);
      }
    },
    [bundle, onUpdateBundleTitle]
  );

  const handleFragmentDragStart = useCallback((event: DragStartEvent) => {
    setDraggingFragmentId(event.active.id as string);
  }, []);

  const handleFragmentDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingFragmentId(null);
      const { active, over } = event;
      if (!over || !bundle) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      const oldIndex = bundle.fragments.findIndex((f) => f.id === activeId);
      const newIndex = bundle.fragments.findIndex((f) => f.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderFragment(bundle.id, oldIndex, newIndex);
      }
    },
    [bundle, onReorderFragment]
  );

  if (!bundle) {
    return (
      <div className="editor-empty">
        {onMobileBack && (
          <button className="mobile-back-btn" onClick={onMobileBack}>
            <Icon name="arrow_back" size={20} />
            <span>{bundleLocation === 'manuscript' ? '원고' : '초안'}으로</span>
          </button>
        )}
        <Icon name="edit_document" size={48} />
        <h3>글 묶음을 선택하세요</h3>
        <p>초안 또는 원고에서 글 묶음을 선택하거나 새로 만들어주세요</p>
      </div>
    );
  }

  const charCount = currentFragment ? countHtmlCharacters(currentFragment.content) : 0;
  const draggingFragment = draggingFragmentId
    ? bundle.fragments.find((f) => f.id === draggingFragmentId)
    : null;
  const draggingIndex = draggingFragment
    ? bundle.fragments.findIndex((f) => f.id === draggingFragmentId)
    : -1;

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="header-top">
          {onMobileBack && (
            <button className="mobile-back-btn" onClick={onMobileBack}>
              <Icon name="arrow_back" size={20} />
            </button>
          )}
          {bundleLocation && (
            <button
              className={`location-badge clickable ${bundleLocation}`}
              onClick={onToggleLocation}
            >
              <Icon name={bundleLocation === 'drafts' ? 'edit_note' : 'article'} size={14} />
              {bundleLocation === 'drafts' ? '초안' : '원고'}
              <Icon name="sync_alt" size={12} />
            </button>
          )}
        </div>
        <div className="header-title-row">
          <input
            type="text"
            className="bundle-title-input"
            value={bundle.title}
            onChange={handleTitleChange}
            placeholder="글 묶음 제목"
          />
        </div>
      </div>

      <DndContext
        sensors={fragmentSensors}
        collisionDetection={closestCenter}
        onDragStart={handleFragmentDragStart}
        onDragEnd={handleFragmentDragEnd}
      >
        <div className="fragment-tabs">
          <SortableContext
            items={bundle.fragments.map((f) => f.id)}
            strategy={horizontalListSortingStrategy}
          >
            {bundle.fragments.map((fragment, index) => (
              <SortableFragmentTab
                key={fragment.id}
                fragment={fragment}
                index={index}
                isActive={currentFragment?.id === fragment.id}
                canDelete={bundle.fragments.length > 1}
                onSelect={() => onSelectFragment(fragment.id)}
                onDelete={() => onDeleteFragment(bundle.id, fragment.id)}
              />
            ))}
          </SortableContext>
          <button
            className="add-fragment-btn"
            onClick={() => onAddFragment(bundle.id)}
          >
            <Icon name="add" size={18} />
          </button>
        </div>
        <DragOverlay>
          {draggingFragment && (
            <div className="fragment-tab active drag-overlay-fragment">
              <span>조각 {draggingIndex + 1}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <div className="editor-content">
        <RichTextEditor
          content={currentFragment?.content || ''}
          onChange={handleContentChange}
          placeholder="여기에 글을 작성하세요..."
        />
      </div>

      <div className="editor-footer">
        <span className="char-count">
          <Icon name="text_fields" size={16} />
          {charCount}자
        </span>
      </div>
    </div>
  );
};
