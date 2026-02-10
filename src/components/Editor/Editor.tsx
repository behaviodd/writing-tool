import { useCallback } from 'react';
import type { Bundle } from '../../types';
import { Icon } from '../Icon/Icon';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import './Editor.css';

interface EditorProps {
  bundle: Bundle | null;
  bundleLocation: 'drafts' | 'manuscript' | null;
  onUpdateContent: (bundleId: string, content: string) => void;
  onUpdateBundleTitle: (bundleId: string, title: string) => void;
  onToggleLocation?: () => void;
}

export const Editor = ({
  bundle,
  bundleLocation,
  onUpdateContent,
  onUpdateBundleTitle,
  onToggleLocation,
}: EditorProps) => {
  const handleContentChange = useCallback(
    (content: string) => {
      if (bundle) {
        onUpdateContent(bundle.id, content);
      }
    },
    [bundle, onUpdateContent]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (bundle) {
        onUpdateBundleTitle(bundle.id, e.target.value);
      }
    },
    [bundle, onUpdateBundleTitle]
  );

  if (!bundle) {
    return (
      <div className="editor-empty">
        <Icon name="edit_document" size={48} />
        <h3>글 묶음을 선택하세요</h3>
        <p>초안 또는 원고에서 글 묶음을 선택하거나 새로 만들어주세요</p>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="header-row">
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
          <input
            type="text"
            className="bundle-title-input"
            value={bundle.title}
            onChange={handleTitleChange}
            placeholder="글 묶음 제목"
          />
        </div>
      </div>

      <div className="editor-content">
        <RichTextEditor
          content={bundle.content}
          onChange={handleContentChange}
          placeholder="여기에 글을 작성하세요..."
        />
      </div>
    </div>
  );
};
