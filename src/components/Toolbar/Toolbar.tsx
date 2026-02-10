import { useState, useEffect, useRef } from 'react';
import type { Project } from '../../types';
import { exportToWord, generateWordBlob } from '../../utils/exportWord';
import { uploadToGoogleDrive } from '../../utils/googleDrive';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../Icon/Icon';
import { ThemeSettings } from '../ThemeSettings/ThemeSettings';
import { useTheme } from '../../contexts/ThemeContext';
import './Toolbar.css';

interface ToolbarProps {
  project: Project;
  onUpdateProjectName: (name: string) => void;
  onGoBack: () => void;
  onSave: () => void;
}

export const Toolbar = ({
  project,
  onUpdateProjectName,
  onGoBack,
  onSave,
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastFading, setToastFading] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSettingsMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsMenu]);

  const showToast = (message: string) => {
    setToastFading(false);
    setToastMessage(message);
    setTimeout(() => {
      setToastFading(true);
      setTimeout(() => {
        setToastMessage(null);
        setToastFading(false);
      }, 300);
    }, 2200);
  };

  const handleSave = () => {
    onSave();
    const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    showToast(`${time}에 저장됨`);
  };

  const handleDownloadWord = async () => {
    setShowSettingsMenu(false);
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

  const handleToggleTheme = () => {
    toggleTheme();
    setShowSettingsMenu(false);
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
          <span className={`sync-icon ${isOnline ? 'online' : 'offline'}`} title={isOnline ? '온라인' : '오프라인'}>
            <Icon name={isOnline ? 'cloud_done' : 'cloud_off'} size={16} />
          </span>
        </div>
      </div>

      <div className="toolbar-right">
        <div className="settings-menu-wrapper" ref={settingsMenuRef}>
          <button
            className="toolbar-btn settings-btn"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            title="설정"
          >
            <Icon name="settings" size={20} />
          </button>
          {showSettingsMenu && (
            <div className="settings-dropdown">
              <button className="settings-dropdown-item" onClick={handleToggleTheme}>
                <Icon name={theme === 'light' ? 'dark_mode' : 'light_mode'} size={18} />
                <span>{theme === 'light' ? '다크 모드' : '라이트 모드'}</span>
              </button>
              <button
                className="settings-dropdown-item"
                onClick={handleDownloadWord}
                disabled={isExporting || project.manuscript.length === 0}
              >
                <Icon name="description" size={18} />
                <span>{isExporting ? '다운로드 중...' : '원고 다운로드'}</span>
              </button>
            </div>
          )}
        </div>
        <button
          className="toolbar-btn drive-btn"
          onClick={handleSaveToDrive}
          disabled={isSavingToDrive || project.manuscript.length === 0}
          title="구글 드라이브에 저장"
        >
          <Icon name="add_to_drive" size={20} />
        </button>
        <button className="toolbar-btn primary save-btn" onClick={handleSave} title="저장">
          <span>저장</span>
        </button>
      </div>
      {toastMessage && (
        <div className={`save-toast ${toastFading ? 'toast-out' : ''}`}>{toastMessage}</div>
      )}
      {showThemeSettings && (
        <ThemeSettings onClose={() => setShowThemeSettings(false)} />
      )}
    </header>
  );
};
