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
              글 묶음은 관련된 글 조각들을 하나로 모은 단위입니다.
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
              <li>글 묶음을 드래그하여 초안 ↔ 원고 간 이동할 수 있습니다</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>
              <Icon name="article" size={20} />
              글 조각
            </h3>
            <p>
              하나의 글 묶음 안에서 여러 개의 조각으로 나눠 작성할 수 있습니다.
              긴 글을 장면이나 단락별로 분리하여 관리하기 좋습니다.
            </p>
          </section>

          <section className="help-section">
            <h3>
              <Icon name="format_paint" size={20} />
              서식 설정
            </h3>
            <p>
              원고 패널에서 서식 버튼을 클릭하면 글씨 크기, 행간, 들여쓰기 등을
              설정할 수 있습니다. 설정된 서식은 Word 다운로드 시 적용됩니다.
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
