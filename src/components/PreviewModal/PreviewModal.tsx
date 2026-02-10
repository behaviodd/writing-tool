import { useState } from 'react';
import type { Bundle } from '../../types';
import { Icon } from '../Icon/Icon';
import { countCharacters, htmlToPlainText } from '../../utils/exportWord';
import './PreviewModal.css';

interface PreviewModalProps {
  bundles: Bundle[];
  onClose: () => void;
}

export const PreviewModal = ({ bundles, onClose }: PreviewModalProps) => {
  const [copied, setCopied] = useState(false);

  const totalChars = countCharacters(bundles);

  const getAllText = (): string => {
    return bundles
      .map((bundle) => htmlToPlainText(bundle.content))
      .join('\n\n---\n\n');
  };

  const handleCopy = async () => {
    const text = getAllText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="preview-modal-backdrop">
      <div className="preview-modal">
        <div className="preview-modal-header">
          <h2>원고 미리보기</h2>
          <span className="preview-char-count">{totalChars.toLocaleString()}자</span>
          <div className="header-spacer" />
          <button
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            disabled={bundles.length === 0}
            title="전체 복사"
          >
            <Icon name={copied ? 'check' : 'content_copy'} size={18} />
            <span>{copied ? '복사됨' : '전체 복사'}</span>
          </button>
          <button className="close-btn" onClick={onClose}>
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className="preview-modal-content">
          <div className="preview-frame">
            {bundles.length === 0 ? (
              <div className="empty-preview">
                <Icon name="article" size={48} />
                <p>원고가 비어있습니다</p>
              </div>
            ) : (
              <div className="preview-document">
                {bundles.map((bundle, bundleIndex) => (
                  <div
                    key={bundle.id}
                    className="preview-bundle"
                    style={{
                      fontSize: `${bundle.formatting.fontSize}px`,
                      lineHeight: bundle.formatting.lineHeight,
                      fontWeight: bundle.formatting.bold ? 'bold' : 'normal',
                      fontStyle: bundle.formatting.italic ? 'italic' : 'normal',
                      textDecoration: bundle.formatting.underline
                        ? 'underline'
                        : 'none',
                      marginTop: bundleIndex > 0 ? '32px' : '0',
                    }}
                  >
                    <div
                      className="preview-content"
                      style={{
                        textIndent: `${bundle.formatting.indent}px`,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: bundle.content || '<p>&nbsp;</p>',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
