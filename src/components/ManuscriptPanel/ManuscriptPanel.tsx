import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Bundle } from '../../types';
import { BundleCard } from '../Bundle/BundleCard';
import { Icon } from '../Icon/Icon';
import { countCharacters } from '../../utils/exportWord';
import './ManuscriptPanel.css';

interface ManuscriptPanelProps {
  bundles: Bundle[];
  currentBundleId: string | null;
  onSelectBundle: (bundleId: string) => void;
  onDeleteBundle: (bundleId: string) => void;
  onMoveBundle?: (bundleId: string) => void;
  onToggleFormat: () => void;
  onOpenPreview: () => void;
  showFormatSidebar: boolean;
  isDropTarget?: boolean;
}

export const ManuscriptPanel = ({
  bundles,
  currentBundleId,
  onSelectBundle,
  onDeleteBundle,
  onMoveBundle,
  onToggleFormat,
  onOpenPreview,
  showFormatSidebar,
  isDropTarget = false,
}: ManuscriptPanelProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'manuscript',
  });

  const totalChars = countCharacters(bundles);
  const currentBundle = bundles.find((b) => b.id === currentBundleId);

  return (
    <div className={`manuscript-panel ${isDropTarget || isOver ? 'drop-target' : ''}`}>
      <div className="panel-header">
        <div className="panel-title">
          <Icon name="article" size={20} />
          <h3>원고</h3>
          <span className="count-badge">{bundles.length}</span>
        </div>
        <div className="header-stats">
          <span className="total-chars">
            <Icon name="text_fields" size={16} />
            {totalChars.toLocaleString()}자
          </span>
        </div>
      </div>

      <div className="panel-actions">
        <button
          className="preview-btn"
          onClick={onOpenPreview}
          disabled={bundles.length === 0}
        >
          <Icon name="visibility" size={18} />
          미리보기
        </button>
        <button
          className={`format-btn ${showFormatSidebar ? 'active' : ''}`}
          onClick={onToggleFormat}
          disabled={!currentBundle}
        >
          <Icon name="format_paint" size={18} />
          서식
        </button>
      </div>

      <div className="manuscript-content">
        <div className="bundle-list" ref={setNodeRef}>
            {bundles.length === 0 ? (
              <div className="empty-state">
                <Icon name="arrow_back" size={32} />
                <p>초안에서 글 묶음을 드래그하세요</p>
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
                    onMove={onMoveBundle ? () => onMoveBundle(bundle.id) : undefined}
                    moveLabel="초안으로 이동"
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
    </div>
  );
};
