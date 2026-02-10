import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Bundle } from '../../types';
import { Icon } from '../Icon/Icon';
import './BundleCard.css';

const stripHtml = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

interface BundleCardProps {
  bundle: Bundle;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const BundleCard = ({
  bundle,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
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

  const plainText = stripHtml(bundle.content);
  const charCount = plainText.length;
  const preview = plainText.slice(0, 60) || '빈 글 묶음';

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
            <span>{charCount.toLocaleString()}자</span>
          </div>
        </div>
      </div>
      <div className="bundle-actions">
        {(onMoveUp || onMoveDown) && (
          <div className="reorder-btns">
            <button
              className="action-btn reorder"
              onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
              disabled={!onMoveUp}
              title="위로"
            >
              <Icon name="keyboard_arrow_up" size={18} />
            </button>
            <button
              className="action-btn reorder"
              onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
              disabled={!onMoveDown}
              title="아래로"
            >
              <Icon name="keyboard_arrow_down" size={18} />
            </button>
          </div>
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
