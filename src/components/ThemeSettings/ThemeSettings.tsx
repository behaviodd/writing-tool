import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../Icon/Icon';
import './ThemeSettings.css';

interface ThemeSettingsProps {
    onClose: () => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onClose }) => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="theme-settings-overlay" onClick={onClose}>
            <div className="theme-settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>화면 설정</h2>
                    <button className="close-btn" onClick={onClose}>
                        <Icon name="close" size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="setting-section">
                        <span className="section-title">화면 모드</span>
                        <div className="theme-options">
                            <button
                                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => setTheme('light')}
                            >
                                <Icon name="light_mode" size={20} />
                                <span>라이트</span>
                            </button>
                            <button
                                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => setTheme('dark')}
                            >
                                <Icon name="dark_mode" size={20} />
                                <span>다크</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
