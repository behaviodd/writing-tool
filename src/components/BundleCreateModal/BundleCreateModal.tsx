import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import './BundleCreateModal.css';

interface BundleCreateModalProps {
  onClose: () => void;
  onCreate: (title: string) => void;
}

export const BundleCreateModal = ({
  onClose,
  onCreate,
}: BundleCreateModalProps) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(title.trim() || '새 글 묶음');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>새 글 묶음 만들기</h2>
          <button className="close-btn" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label htmlFor="bundle-title">글 묶음 제목</label>
            <input
              id="bundle-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="글 묶음의 제목을 입력해 주세요."
              autoFocus
            />
            <p className="helper-text">
              글 묶음은 여러 개의 글 조각을 하나로 묶어 관리할 수 있습니다.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className="btn-create"
            >
              <Icon name="add" size={18} />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
