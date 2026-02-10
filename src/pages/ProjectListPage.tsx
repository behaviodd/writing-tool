import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon/Icon';
import { ConfirmModal } from '../components/ConfirmModal/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import type { ProjectMeta } from '../types';
import { createProject } from '../types';
import {
  getAllProjects,
  saveProject,
  deleteProject as deleteProjectFromStorage,
  setCurrentProjectId,
  syncFromFirestore,
} from '../utils/storage';
import './ProjectListPage.css';

export const ProjectListPage = () => {
  const navigate = useNavigate();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [syncing, setSyncing] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
  };

  const calculateDelete = (e: React.MouseEvent, projectId: string) => {
    // Kept for reference but unused, replacing with handleDeleteClick
  }

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProjectFromStorage(projectToDelete, user?.uid);
      refreshProjects();
      setProjectToDelete(null);
    }
  };


  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Login error:', error);
      const code = error?.code || '';
      if (code === 'auth/unauthorized-domain') {
        alert('이 도메인이 Firebase에 등록되지 않았습니다.\nFirebase Console > Authentication > Settings > 승인된 도메인에 현재 도메인을 추가해주세요.');
      } else {
        alert(`로그인에 실패했습니다.\n(${code || error?.message || '알 수 없는 오류'})`);
      }
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

  if (!user) {
    return (
      <div className="landing-page">
        <header className="landing-header">
          <div className="landing-header-content">
            <h1>글쓰기 도구</h1>
            <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'light' ? '다크 모드' : '라이트 모드'}>
              <Icon name={theme === 'light' ? 'dark_mode' : 'light_mode'} size={20} />
            </button>
          </div>
        </header>

        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">작가들을 위한<br />가장 심플한 글쓰기 도구</h2>
            <p className="hero-description">
              복잡한 기능은 덜어내고 오직 글쓰기에만 집중하세요.<br />
              인터넷이 없어도, 언제 어디서나 당신의 영감을 기록할 수 있습니다.
            </p>
            <button className="google-sign-in-btn large" onClick={handleGoogleSignIn}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google로 시작하기</span>
            </button>
          </div>
        </section>

        <section className="features-section">
          <div className="section-content">
            <h3>주요 기능</h3>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="wifi_off" size={32} />
                </div>
                <h4>오프라인 지원</h4>
                <p>인터넷 연결이 끊겨도 걱정하지 마세요. 작업 내용은 안전하게 저장됩니다.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="cloud_sync" size={32} />
                </div>
                <h4>자동 동기화</h4>
                <p>온라인 상태가 되면 모든 작업이 클라우드에 자동으로 안전하게 백업됩니다.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Icon name="edit_note" size={32} />
                </div>
                <h4>초안과 원고 관리</h4>
                <p>떠오르는 생각을 '초안'에 적고, 다듬어진 글은 '원고'로 옮겨 체계적으로 관리하세요.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <div className="section-content">
            <h3>사용 방법</h3>
            <div className="guide-steps">
              <div className="guide-step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>프로젝트 만들기</h4>
                  <p>새로운 글쓰기 프로젝트를 생성하고 제목을 정해주세요.</p>
                </div>
              </div>
              <div className="guide-step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>초안 작성하기</h4>
                  <p>에디터에서 자유롭게 글을 쓰고 '초안' 탭에 저장하세요. 여러 개의 초안을 만들 수 있습니다.</p>
                </div>
              </div>
              <div className="guide-step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>원고 완성하기</h4>
                  <p>완성된 초안을 드래그하여 '원고' 탭으로 옮기세요. 원고에 있는 글들은 순서를 자유롭게 바꿀 수 있습니다.</p>
                </div>
              </div>
              <div className="guide-step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <h4>내보내기</h4>
                  <p>완성된 원고는 Word 파일로 다운로드하거나 Google Drive에 바로 저장할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="landing-footer">
          <p>© 2024 Writing Tool. All rights reserved.</p>
        </footer>
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
              <div className="user-info">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="user-avatar" />
                )}
                <div className="user-details">
                  <span className="user-name">{user.displayName}</span>
                  <div className="user-actions">
                    <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'light' ? '다크 모드' : '라이트 모드'}>
                      <Icon name={theme === 'light' ? 'dark_mode' : 'light_mode'} size={16} />
                    </button>
                    <span className="divider">|</span>
                    <button className="sign-out-btn" onClick={handleSignOut}>
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
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
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteClick(e, project.id)}
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

      {projectToDelete && (
        <ConfirmModal
          title="프로젝트 삭제"
          message="정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmText="삭제"
          isDestructive
          onConfirm={handleConfirmDelete}
          onCancel={() => setProjectToDelete(null)}
        />
      )}

    </div>
  );
};
