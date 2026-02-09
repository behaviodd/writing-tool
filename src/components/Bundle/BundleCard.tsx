import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Bundle } from '../../types';
import { Icon } from '../Icon/Icon';
import './BundleCard.css';

interface BundleCardProps {
  bundle: Bundle;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMove?: () => void;
  moveLabel?: string;
}

export const BundleCard = ({
  bundle,
  isSelected,
  onSelect,
  onDelete,
  onMove,
  moveLabel,
}: BundleCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bundle.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const totalChars = bundle.fragments.reduce(
    (sum, f) => sum + f.content.length,
    0
  );

  const preview = bundle.fragments[0]?.content.slice(0, 60) || '빈 글 묶음';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bundle-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="bundle-card-content">
        <button className="drag-handle" {...attributes} {...listeners}>
          <Icon name="drag_indicator" size={20} />
        </button>
        <div className="bundle-info">
          <h4 className="bundle-title">{bundle.title}</h4>
          <p className="bundle-preview">{preview}</p>
          <div className="bundle-meta">
            <span>{bundle.fragments.length}개 조각</span>
            <span className="meta-dot" />
            <span>{totalChars.toLocaleString()}자</span>
          </div>
        </div>
      </div>
      <div className="bundle-actions">
        {onMove && (
          <button
            className="action-btn move"
            onClick={(e) => {
              e.stopPropagation();
              onMove();
            }}
            title={moveLabel || '이동'}
          >
            <Icon name="drive_file_move" size={18} />
          </button>
        )}
        <button
          className="action-btn delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="삭제"
        >
          <Icon name="delete" size={18} />
        </button>
      </div>
    </div>
  );
};
