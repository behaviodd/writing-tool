import type { FormattingOptions } from '../../types';
import { Icon } from '../Icon/Icon';
import './FormatSidebar.css';

interface FormatSidebarProps {
  formatting: FormattingOptions;
  onChange: (formatting: FormattingOptions) => void;
  onClose: () => void;
}

export const FormatSidebar = ({
  formatting,
  onChange,
  onClose,
}: FormatSidebarProps) => {
  const handleChange = (key: keyof FormattingOptions, value: number | boolean) => {
    onChange({ ...formatting, [key]: value });
  };

  return (
    <>
    <div className="format-sidebar-overlay" onClick={onClose} />
    <div className="format-sidebar">
      <div className="sidebar-header">
        <h3>서식 설정</h3>
        <button className="close-btn" onClick={onClose}>
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="sidebar-content">
        <div className="format-section">
          <h4>텍스트</h4>
          <div className="format-row">
            <label>
              <Icon name="format_size" size={18} />
              글씨 크기
            </label>
            <div className="control-group">
              <input
                type="range"
                min="10"
                max="24"
                value={formatting.fontSize}
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              />
              <span className="value">{formatting.fontSize}pt</span>
            </div>
          </div>

          <div className="format-row">
            <label>
              <Icon name="format_line_spacing" size={18} />
              행간
            </label>
            <div className="control-group">
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={formatting.lineHeight}
                onChange={(e) => handleChange('lineHeight', Number(e.target.value))}
              />
              <span className="value">{formatting.lineHeight.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="format-section">
          <h4>단락</h4>
          <div className="format-row">
            <label>
              <Icon name="format_indent_increase" size={18} />
              들여쓰기
            </label>
            <div className="control-group">
              <input
                type="range"
                min="0"
                max="50"
                value={formatting.indent}
                onChange={(e) => handleChange('indent', Number(e.target.value))}
              />
              <span className="value">{formatting.indent}px</span>
            </div>
          </div>

          <div className="format-row">
            <label>
              <Icon name="density_medium" size={18} />
              단락 간격
            </label>
            <div className="control-group">
              <input
                type="range"
                min="0"
                max="30"
                value={formatting.paragraphSpacing}
                onChange={(e) => handleChange('paragraphSpacing', Number(e.target.value))}
              />
              <span className="value">{formatting.paragraphSpacing}px</span>
            </div>
          </div>
        </div>

        <div className="format-section">
          <h4>스타일</h4>
          <div className="style-buttons">
            <button
              className={`style-btn ${formatting.bold ? 'active' : ''}`}
              onClick={() => handleChange('bold', !formatting.bold)}
            >
              <Icon name="format_bold" size={20} />
              <span>굵게</span>
            </button>
            <button
              className={`style-btn ${formatting.italic ? 'active' : ''}`}
              onClick={() => handleChange('italic', !formatting.italic)}
            >
              <Icon name="format_italic" size={20} />
              <span>기울임</span>
            </button>
            <button
              className={`style-btn ${formatting.underline ? 'active' : ''}`}
              onClick={() => handleChange('underline', !formatting.underline)}
            >
              <Icon name="format_underlined" size={20} />
              <span>밑줄</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
