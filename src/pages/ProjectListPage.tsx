import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon/Icon';
import { useAuth } from '../contexts/AuthContext';
import type { ProjectMeta } from '../types';
import { createProject } from '../types';
import {
  getAllProjects,
  saveProject,
  deleteProject as deleteProjectFromStorage,
  setCurrentProjectId,
  importProjectFromJson,
  syncFromFirestore,
} from '../utils/storage';
import './ProjectListPage.css';

export const ProjectListPage = () => {
  const navigate = useNavigate();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshProjects = () => {
    setProjects(getAllProjects());
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  useEffect(() => {
    if (user && !syncing) {
      setSyncing(true);
      syncFromFirestore(user.uid)
        .then(() => refreshProjects())
        .finally(() => setSyncing(false));
    }
  }, [user]);

  const handleCreateProject = () => {
    const project = createProject();
    saveProject(project, user?.uid);
    setCurrentProjectId(project.id);
    navigate(`/project/${project.id}`);
  };

  const handleOpenProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    navigate(`/project/${projectId}`);
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      deleteProjectFromStorage(projectId, user?.uid);
      refreshProjects();
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const project = await importProjectFromJson(file);
        saveProject(project, user?.uid);
        refreshProjects();
      } catch (error) {
        alert('프로젝트 파일을 불러오는데 실패했습니다.');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="project-list-page">
      <header className="page-header">
        <div className="header-content">
          <div className="header-top">
            <div>
              <h1>글쓰기 도구</h1>
              <p className="header-subtitle">오프라인에서도 사용 가능한 작가용 글쓰기 도구</p>
            </div>
            <div className="auth-section">
              {user ? (
                <div className="user-info">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="user-avatar" />
                  )}
                  <div className="user-details">
                    <span className="user-name">{user.displayName}</span>
                    <button className="sign-out-btn" onClick={handleSignOut}>
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <button className="google-sign-in-btn" onClick={handleGoogleSignIn}>
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google로 로그인</span>
                </button>
              )}
            </div>
          </div>
          {syncing && (
            <div className="sync-indicator">
              <div className="loading-spinner small" />
              <span>동기화 중...</span>
            </div>
          )}
        </div>
      </header>

      <main className="page-content">
        <div className="section-header">
          <h2>내 프로젝트</h2>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleImportClick}>
              <Icon name="upload_file" size={20} />
              <span>불러오기</span>
            </button>
            <button className="btn-primary" onClick={handleCreateProject}>
              <Icon name="add" size={20} />
              <span>새 프로젝트</span>
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <Icon name="edit_document" size={64} />
            <h3>아직 프로젝트가 없습니다</h3>
            <p>새 프로젝트를 만들어 글쓰기를 시작하세요</p>
            <button className="btn-primary large" onClick={handleCreateProject}>
              <Icon name="add" size={20} />
              <span>첫 번째 프로젝트 만들기</span>
            </button>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleOpenProject(project.id)}
              >
                <div className="card-header">
                  <div className="card-icon">
                    <Icon name="description" size={24} />
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteProject(e, project.id)}
                  >
                    <Icon name="delete" size={20} />
                  </button>
                </div>
                <h3 className="card-title">{project.name}</h3>
                <div className="card-meta">
                  <span className="meta-item">
                    <Icon name="folder" size={16} />
                    {project.totalBundles}개 묶음
                  </span>
                  <span className="meta-item">
                    <Icon name="text_fields" size={16} />
                    {project.totalCharacters.toLocaleString()}자
                  </span>
                </div>
                <div className="card-footer">
                  <span className="updated-at">{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};
