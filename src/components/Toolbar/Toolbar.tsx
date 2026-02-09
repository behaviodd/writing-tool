import { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { exportToWord, generateWordBlob } from '../../utils/exportWord';
import { uploadToGoogleDrive } from '../../utils/googleDrive';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../Icon/Icon';
import './Toolbar.css';

interface ToolbarProps {
  project: Project;
  onUpdateProjectName: (name: string) => void;
  onGoBack: () => void;
  onSave: () => void;
  lastSavedAt: number | null;
}

export const Toolbar = ({
  project,
  onUpdateProjectName,
  onGoBack,
  onSave,
  lastSavedAt,
}: ToolbarProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { getGoogleAccessToken } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);

  const handleDownloadWord = async () => {
    if (project.manuscript.length === 0) {
      alert('원고에 글 묶음이 없습니다.');
      return;
    }
    setIsExporting(true);
    try {
      await exportToWord(project.manuscript, project.name);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Word 파일 내보내기에 실패했습니다.');
    }
    setIsExporting(false);
  };

  const handleSaveToDrive = async () => {
    if (project.manuscript.length === 0) {
      alert('원고에 글 묶음이 없습니다.');
      return;
    }
    setIsSavingToDrive(true);
    try {
      const accessToken = await getGoogleAccessToken();
      const blob = await generateWordBlob(project.manuscript);
      const result = await uploadToGoogleDrive(
        accessToken,
        blob,
        project.name
      );
      if (result.webViewLink && confirm('Google Drive에 저장되었습니다. 문서를 열까요?')) {
        window.open(result.webViewLink, '_blank');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        alert('인증이 만료되었습니다. 다시 시도해주세요.');
      } else {
        console.error('Drive save failed:', error);
        alert(
          error instanceof Error
            ? error.message
            : 'Google Drive 저장에 실패했습니다.'
        );
      }
    }
    setIsSavingToDrive(false);
  };

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <button className="back-btn" onClick={onGoBack}>
          <Icon name="arrow_back" size={20} />
        </button>
        <div className="project-info">
          <input
            type="text"
            className="project-name-input"
            value={project.name}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            placeholder="프로젝트 이름"
          />
        </div>
      </div>

      <div className="toolbar-right">
        <div className="save-area">
          <button className="toolbar-btn save-btn" onClick={onSave}>
            <Icon name="save" size={20} />
            <span>저장</span>
          </button>
          {lastSavedAt && (
            <span className="last-saved-time">
              {new Date(lastSavedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} 저장됨
            </span>
          )}
        </div>
        <div className={`sync-status ${isOnline ? 'online' : 'offline'}`}>
          <Icon name={isOnline ? 'cloud_done' : 'cloud_off'} size={18} />
          <span>{isOnline ? '온라인' : '오프라인'}</span>
        </div>
        <button
          className="toolbar-btn primary"
          onClick={handleDownloadWord}
          disabled={isExporting || project.manuscript.length === 0}
        >
          <Icon name="description" size={20} />
          <span>{isExporting ? '다운로드 중...' : '원고 다운로드'}</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={handleSaveToDrive}
          disabled={isSavingToDrive || project.manuscript.length === 0}
        >
          <Icon name="add_to_drive" size={20} />
          <span>{isSavingToDrive ? '저장 중...' : '드라이브에 저장'}</span>
        </button>
      </div>
    </header>
  );
};
