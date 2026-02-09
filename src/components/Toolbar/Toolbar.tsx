import { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { exportProjectToJson } from '../../utils/storage';
import { exportToWord } from '../../utils/exportWord';
import { Icon } from '../Icon/Icon';
import './Toolbar.css';

interface ToolbarProps {
  project: Project;
  onUpdateProjectName: (name: string) => void;
  onGoBack: () => void;
}

export const Toolbar = ({
  project,
  onUpdateProjectName,
  onGoBack,
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

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    exportProjectToJson(project);
  };

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
        <div className={`sync-status ${isOnline ? 'online' : 'offline'}`}>
          <Icon name={isOnline ? 'cloud_done' : 'cloud_off'} size={18} />
          <span>{isOnline ? '저장됨' : '오프라인'}</span>
        </div>
        <button
          className="toolbar-btn primary"
          onClick={handleDownloadWord}
          disabled={isExporting || project.manuscript.length === 0}
        >
          <Icon name="description" size={20} />
          <span>{isExporting ? '다운로드 중...' : '원고 다운로드'}</span>
        </button>
        <button className="toolbar-btn" onClick={handleExport}>
          <Icon name="upload_file" size={20} />
          <span>프로젝트 내보내기</span>
        </button>
      </div>
    </header>
  );
};
