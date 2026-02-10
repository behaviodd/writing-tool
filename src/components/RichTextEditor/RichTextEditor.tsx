import { useRef, useEffect, useCallback } from 'react';
import { Icon } from '../Icon/Icon';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({
  content,
  onChange,
  placeholder = '여기에 글을 작성하세요...',
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync content from props to editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '';
      }
    }
    isInternalChange.current = false;
  }, [content]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const isFormatActive = useCallback((command: string): boolean => {
    return document.queryCommandState(command);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  }, [execCommand]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const getTextLength = (): number => {
    return editorRef.current?.innerText.length || 0;
  };

  return (
    <div className="rich-text-editor">
      <div className="rte-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${isFormatActive('bold') ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('bold');
            }}
            title="굵게 (Ctrl+B)"
          >
            <Icon name="format_bold" size={18} />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${isFormatActive('italic') ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('italic');
            }}
            title="기울임 (Ctrl+I)"
          >
            <Icon name="format_italic" size={18} />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${isFormatActive('underline') ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('underline');
            }}
            title="밑줄 (Ctrl+U)"
          >
            <Icon name="format_underlined" size={18} />
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${isFormatActive('strikeThrough') ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('strikeThrough');
            }}
            title="취소선"
          >
            <Icon name="strikethrough_s" size={18} />
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${isFormatActive('justifyLeft') ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('justifyLeft');
            }}
            title="왼쪽 정렬"
          >
            <Icon name="format_align_left" size={18} />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${isFormatActive('justifyCenter') ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('justifyCenter');
            }}
            title="가운데 정렬"
          >
            <Icon name="format_align_center" size={18} />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${isFormatActive('justifyRight') ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('justifyRight');
            }}
            title="오른쪽 정렬"
          >
            <Icon name="format_align_right" size={18} />
          </button>
        </div>
        <div className="toolbar-spacer" />
        <span className="char-count">{getTextLength()}자</span>
      </div>

      <div
        ref={editorRef}
        className="rte-content"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};

// Utility function to convert HTML to plain text
export const htmlToPlainText = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

// Utility function to count characters from HTML
export const countHtmlCharacters = (html: string): number => {
  return htmlToPlainText(html).length;
};
