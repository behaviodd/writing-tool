import { useCallback } from 'react';
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
}

export const Editor = ({
  bundle,
  currentFragment,
  bundleLocation,
  onUpdateFragment,
  onAddFragment,
  onDeleteFragment,
  onSelectFragment,
  onUpdateBundleTitle,
}: EditorProps) => {
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

  if (!bundle) {
    return (
      <div className="editor-empty">
        <Icon name="edit_document" size={48} />
        <h3>글 묶음을 선택하세요</h3>
        <p>왼쪽에서 글 묶음을 선택하거나 새로 만들어주세요</p>
      </div>
    );
  }

  const charCount = currentFragment ? countHtmlCharacters(currentFragment.content) : 0;

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="header-top">
          <input
            type="text"
            className="bundle-title-input"
            value={bundle.title}
            onChange={handleTitleChange}
            placeholder="글 묶음 제목"
          />
          {bundleLocation && (
            <span className={`location-badge ${bundleLocation}`}>
              <Icon name={bundleLocation === 'drafts' ? 'edit_note' : 'article'} size={14} />
              {bundleLocation === 'drafts' ? '초안' : '원고'}
            </span>
          )}
        </div>
      </div>

      <div className="fragment-tabs">
        {bundle.fragments.map((fragment, index) => (
          <button
            key={fragment.id}
            className={`fragment-tab ${
              currentFragment?.id === fragment.id ? 'active' : ''
            }`}
            onClick={() => onSelectFragment(fragment.id)}
          >
            <span>조각 {index + 1}</span>
            {bundle.fragments.length > 1 && (
              <span
                className="delete-fragment"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFragment(bundle.id, fragment.id);
                }}
              >
                <Icon name="close" size={14} />
              </span>
            )}
          </button>
        ))}
        <button
          className="add-fragment-btn"
          onClick={() => onAddFragment(bundle.id)}
        >
          <Icon name="add" size={18} />
        </button>
      </div>

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
