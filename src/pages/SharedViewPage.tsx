import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedDocument } from '../utils/share';
import { countCharacters } from '../utils/exportWord';
import type { SharedDocument } from '../types';
import { Icon } from '../components/Icon/Icon';
import './SharedViewPage.css';

type ViewState = 'loading' | 'ready' | 'not_found' | 'error';

export const SharedViewPage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [state, setState] = useState<ViewState>('loading');
  const [shared, setShared] = useState<SharedDocument | null>(null);

  useEffect(() => {
    if (!shareId) {
      setState('not_found');
      return;
    }

    const load = async () => {
      try {
        const doc = await getSharedDocument(shareId);
        if (doc) {
          setShared(doc);
          setState('ready');
        } else {
          setState('not_found');
        }
      } catch {
        setState('error');
      }
    };

    load();
  }, [shareId]);

  if (state === 'loading') {
    return (
      <div className="shared-view-loading">
        <div className="shared-view-spinner" />
        <span>불러오는 중...</span>
      </div>
    );
  }

  if (state === 'not_found') {
    return (
      <div className="shared-view-error">
        <Icon name="link_off" size={48} />
        <p>링크를 찾을 수 없습니다</p>
        <span style={{ fontSize: '14px', color: 'var(--gray-400)' }}>
          만료되었거나 삭제된 링크입니다.
        </span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="shared-view-error">
        <Icon name="error" size={48} />
        <p>오류가 발생했습니다</p>
        <button
          style={{
            marginTop: '8px',
            padding: '8px 20px',
            background: 'var(--gray-900)',
            color: 'var(--gray-50)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
          }}
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!shared) return null;

  const totalChars = countCharacters(shared.bundles);

  return (
    <div className="shared-view-page">
      <header className="shared-view-header">
        <h1>{shared.projectName}</h1>
        <span className="shared-view-char-count">
          {totalChars.toLocaleString()}자
        </span>
        <span className="shared-view-badge">읽기 전용</span>
      </header>

      <div className="shared-view-content">
        <div className="shared-view-frame">
          <div className="shared-view-document">
            {shared.bundles.map((bundle, bundleIndex) => (
              <div
                key={bundle.id}
                className="shared-view-bundle"
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
                  className="shared-bundle-content"
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
        </div>
      </div>

      <footer className="shared-view-footer">
        공유된 원고 &middot; 만료:{' '}
        {new Date(shared.expiresAt).toLocaleDateString('ko-KR')}
      </footer>
    </div>
  );
};
