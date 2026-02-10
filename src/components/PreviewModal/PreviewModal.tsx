import { useState, useEffect } from 'react';
import type { Bundle, SharedDocument } from '../../types';
import { Icon } from '../Icon/Icon';
import { countCharacters, htmlToPlainText } from '../../utils/exportWord';
import {
  getLocalShareId,
  clearLocalShareId,
  createShareLink,
  updateShareLink,
  revokeShareLink,
  getSharedDocument,
  getShareUrl,
} from '../../utils/share';
import { useAuth } from '../../contexts/AuthContext';
import './PreviewModal.css';

interface PreviewModalProps {
  bundles: Bundle[];
  onClose: () => void;
  projectId?: string;
  projectName?: string;
}

type ShareState = 'idle' | 'loading' | 'active' | 'error';

export const PreviewModal = ({
  bundles,
  onClose,
  projectId,
  projectName,
}: PreviewModalProps) => {
  const [copied, setCopied] = useState(false);
  const [shareState, setShareState] = useState<ShareState>(() => {
    if (!projectId) return 'idle';
    return getLocalShareId(projectId) ? 'loading' : 'idle';
  });
  const [sharedDoc, setSharedDoc] = useState<SharedDocument | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const { user } = useAuth();
  const totalChars = countCharacters(bundles);

  // Verify existing share on mount (single getDoc, no compound query)
  useEffect(() => {
    if (!projectId) return;
    const localShareId = getLocalShareId(projectId);
    if (!localShareId) return;

    let cancelled = false;
    setShareState('loading');

    getSharedDocument(localShareId)
      .then((doc) => {
        if (cancelled) return;
        if (doc) {
          setSharedDoc(doc);
          setShareState('active');
        } else {
          clearLocalShareId(projectId);
          setShareState('idle');
        }
      })
      .catch(() => {
        if (!cancelled) setShareState('idle');
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const getAllText = (): string =>
    bundles.map((b) => htmlToPlainText(b.content)).join('\n\n---\n\n');

  const handleCopy = async () => {
    const text = getAllText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateShare = async () => {
    if (!projectId || !user || !projectName) return;
    // Optimistic: build doc locally and show active immediately
    const shareId = crypto.randomUUID();
    const now = Date.now();
    const optimistic: SharedDocument = {
      id: shareId,
      projectId,
      ownerId: user.uid,
      projectName,
      bundles,
      createdAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000,
      updatedAt: now,
    };
    setSharedDoc(optimistic);
    setShareState('active');
    try {
      await createShareLink(projectId, user.uid, projectName, bundles, shareId);
    } catch {
      setSharedDoc(null);
      setShareState('error');
    }
  };

  const handleUpdateShare = async () => {
    if (!sharedDoc || !projectName) return;
    const prev = sharedDoc;
    const now = Date.now();
    setSharedDoc({ ...sharedDoc, projectName, bundles, updatedAt: now, expiresAt: now + 7 * 24 * 60 * 60 * 1000 });
    try {
      await updateShareLink(sharedDoc.id, projectName, bundles);
    } catch {
      setSharedDoc(prev);
      setShareState('error');
    }
  };

  const handleRevokeShare = async () => {
    if (!sharedDoc || !projectId) return;
    const prev = sharedDoc;
    setSharedDoc(null);
    setShareState('idle');
    try {
      await revokeShareLink(sharedDoc.id, projectId);
    } catch {
      setSharedDoc(prev);
      setShareState('error');
    }
  };

  const copyLink = async () => {
    if (!sharedDoc) return;
    const url = getShareUrl(sharedDoc.id);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareDisabled = !user || !projectId || bundles.length === 0;
  const shareTooltip = !user
    ? '로그인이 필요합니다'
    : bundles.length === 0
      ? '원고가 비어있습니다'
      : '공유 링크 생성';
  const shareUrl = sharedDoc ? getShareUrl(sharedDoc.id) : '';

  return (
    <div className="preview-modal-backdrop">
      <div className="preview-modal">
        <div className="preview-modal-header">
          <h2>원고 미리보기</h2>
          <span className="preview-char-count">{totalChars.toLocaleString()}자</span>
          <div className="header-spacer" />

          {/* Desktop share controls */}
          <div className="share-desktop">
            {shareState === 'idle' && (
              <button
                className="share-btn"
                onClick={handleCreateShare}
                disabled={shareDisabled}
                title={shareTooltip}
              >
                <Icon name="link" size={18} />
                <span>공유</span>
              </button>
            )}
            {shareState === 'loading' && (
              <div className="share-loading">
                <div className="share-spinner" />
                <span>처리 중...</span>
              </div>
            )}
            {shareState === 'active' && (
              <div className="share-active-group">
                <button
                  className={`share-link-btn ${linkCopied ? 'copied' : ''}`}
                  onClick={copyLink}
                  title="공유 링크 복사"
                >
                  <Icon name={linkCopied ? 'check' : 'content_copy'} size={16} />
                  <span>{linkCopied ? '복사됨' : '링크 복사'}</span>
                </button>
                <button className="share-update-btn" onClick={handleUpdateShare} title="최신 원고로 업데이트">
                  <Icon name="sync" size={16} />
                  <span>업데이트</span>
                </button>
                <button className="share-revoke-btn" onClick={handleRevokeShare} title="공유 취소">
                  <Icon name="link_off" size={16} />
                  <span>공유 취소</span>
                </button>
              </div>
            )}
            {shareState === 'error' && (
              <button className="share-error-btn" onClick={handleCreateShare}>
                <Icon name="refresh" size={18} />
                <span>다시 시도</span>
              </button>
            )}
          </div>

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
                {bundles.map((bundle, i) => (
                  <div
                    key={bundle.id}
                    className="preview-bundle"
                    style={{
                      fontSize: `${bundle.formatting.fontSize}px`,
                      lineHeight: bundle.formatting.lineHeight,
                      fontWeight: bundle.formatting.bold ? 'bold' : 'normal',
                      fontStyle: bundle.formatting.italic ? 'italic' : 'normal',
                      textDecoration: bundle.formatting.underline ? 'underline' : 'none',
                      marginTop: i > 0 ? '32px' : '0',
                    }}
                  >
                    <div
                      className="preview-content"
                      style={{ textIndent: `${bundle.formatting.indent}px` }}
                      dangerouslySetInnerHTML={{ __html: bundle.content || '<p>&nbsp;</p>' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile share bar */}
        <div className="share-mobile-bar">
          {shareState === 'idle' && (
            <button className="smb-create" onClick={handleCreateShare} disabled={shareDisabled} title={shareTooltip}>
              <Icon name="link" size={20} />
              <span>공유 링크 만들기</span>
            </button>
          )}
          {shareState === 'loading' && (
            <div className="smb-loading">
              <div className="share-spinner" />
              <span>처리 중...</span>
            </div>
          )}
          {shareState === 'active' && (
            <div className="smb-active">
              <div className="smb-url-row">
                <Icon name="link" size={16} />
                <span className="smb-url-text">{shareUrl}</span>
              </div>
              <div className="smb-actions">
                <button className={`smb-copy ${linkCopied ? 'copied' : ''}`} onClick={copyLink}>
                  <Icon name={linkCopied ? 'check' : 'content_copy'} size={18} />
                  <span>{linkCopied ? '복사됨' : '링크 복사'}</span>
                </button>
                <button className="smb-update" onClick={handleUpdateShare}>
                  <Icon name="sync" size={18} />
                  <span>업데이트</span>
                </button>
                <button className="smb-revoke" onClick={handleRevokeShare}>
                  <Icon name="link_off" size={18} />
                  <span>취소</span>
                </button>
              </div>
            </div>
          )}
          {shareState === 'error' && (
            <button className="smb-error" onClick={handleCreateShare}>
              <Icon name="refresh" size={20} />
              <span>다시 시도</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
