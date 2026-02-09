import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Bundle } from '../../types';
import { BundleCard } from '../Bundle/BundleCard';
import { Icon } from '../Icon/Icon';
import './DraftPanel.css';

interface DraftPanelProps {
  bundles: Bundle[];
  currentBundleId: string | null;
  onSelectBundle: (bundleId: string) => void;
  onDeleteBundle: (bundleId: string) => void;
  onAddBundle: () => void;
  onShowHelp: () => void;
  isDropTarget?: boolean;
}

export const DraftPanel = ({
  bundles,
  currentBundleId,
  onSelectBundle,
  onDeleteBundle,
  onAddBundle,
  onShowHelp,
  isDropTarget = false,
}: DraftPanelProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'drafts',
  });

  return (
    <div className={`draft-panel ${isDropTarget || isOver ? 'drop-target' : ''}`}>
      <div className="panel-header">
        <div className="panel-title">
          <Icon name="edit_note" size={20} />
          <h3>초안</h3>
          <span className="count-badge">{bundles.length}</span>
        </div>
        <div className="header-actions">
          <button className="help-btn" onClick={onShowHelp} title="사용 가이드">
            <Icon name="help_outline" size={20} />
          </button>
          <button className="add-btn" onClick={onAddBundle} title="새 글 묶음">
            <Icon name="add" size={20} />
          </button>
        </div>
      </div>

      <div className="bundle-list" ref={setNodeRef}>
        {bundles.length === 0 ? (
          <div className="empty-state">
            <Icon name="edit_document" size={32} />
            <p>초안이 없습니다</p>
            <button className="create-btn" onClick={onAddBundle}>
              <Icon name="add" size={18} />
              <span>새 글 묶음</span>
            </button>
          </div>
        ) : (
          <SortableContext
            items={bundles.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {bundles.map((bundle) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                isSelected={bundle.id === currentBundleId}
                onSelect={() => onSelectBundle(bundle.id)}
                onDelete={() => onDeleteBundle(bundle.id)}
              />
            ))}
          </SortableContext>
        )}
      </div>

      {(isDropTarget || isOver) && bundles.length > 0 && (
        <div className="drop-indicator">
          <Icon name="add" size={18} />
          <span>여기에 놓으세요</span>
        </div>
      )}
    </div>
  );
};
