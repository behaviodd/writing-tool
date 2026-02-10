import { Icon } from '../Icon/Icon';
import './HelpModal.css';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal = ({ onClose }: HelpModalProps) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="help-modal-backdrop" onClick={handleBackdropClick}>
      <div className="help-modal">
        <div className="help-modal-header">
          <h2>사용 가이드</h2>
          <button className="close-btn" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="help-modal-content">
          <section className="help-section">
            <h3>
              <Icon name="edit_note" size={20} />
              글 묶음이란?
            </h3>
            <p>
              글 묶음은 하나의 글 단위입니다.
              예를 들어 소설의 한 장(章)이나 블로그 포스트 하나가 될 수 있습니다.
            </p>
          </section>

          <section className="help-section">
            <h3>
              <Icon name="layers" size={20} />
              초안과 원고
            </h3>
            <ul>
              <li><strong>초안:</strong> 작성 중인 글을 보관하는 공간</li>
              <li><strong>원고:</strong> 완성된 글을 모아 출판 준비하는 공간</li>
              <li>글 묶음을 드래그하거나 에디터에서 초안/원고 버튼을 클릭하여 이동할 수 있습니다</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>
              <Icon name="edit_document" size={20} />
              에디터
            </h3>
            <p>
              글 묶음을 선택하면 에디터에서 내용을 작성할 수 있습니다.
              굵게, 기울임, 밑줄, 취소선 등의 서식을 지원하며,
              키보드 단축키(Ctrl+B, Ctrl+I, Ctrl+U)도 사용 가능합니다.
            </p>
          </section>

          <section className="help-section">
            <h3>
              <Icon name="description" size={20} />
              원고 다운로드
            </h3>
            <p>
              상단의 [원고 다운로드] 버튼으로 원고 탭의 모든 글 묶음을
              Word(.docx) 파일로 내보낼 수 있습니다.
            </p>
          </section>

          <section className="help-section">
            <h3>
              <Icon name="add_to_drive" size={20} />
              Google Drive에 저장
            </h3>
            <p>
              상단의 [드라이브에 저장] 버튼으로 원고를 Google Drive에
              Google Docs 문서로 저장할 수 있습니다.
              저장 후 바로 문서를 열어볼 수 있습니다.
            </p>
          </section>

          <section className="help-section">
            <h3>
              <Icon name="cloud_done" size={20} />
              자동 저장
            </h3>
            <p>
              작성 중인 내용은 자동으로 저장됩니다. 오프라인에서도 사용 가능하며,
              Google 로그인 시 클라우드에 동기화됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
