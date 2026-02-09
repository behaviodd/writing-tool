import type { FormattingOptions } from '../../types';
import { Icon } from '../Icon/Icon';
import './FormatToolbar.css';

interface FormatToolbarProps {
  formatting: FormattingOptions;
  onChange: (formatting: FormattingOptions) => void;
}

export const FormatToolbar = ({
  formatting,
  onChange,
}: FormatToolbarProps) => {
  const handleChange = (key: keyof FormattingOptions, value: number | boolean) => {
    onChange({ ...formatting, [key]: value });
  };

  return (
    <div className="format-toolbar">
      <div className="format-row">
        <div className="format-group">
          <label>
            <Icon name="format_size" size={16} />
            크기
          </label>
          <div className="slider-container">
            <input
              type="range"
              min="10"
              max="24"
              value={formatting.fontSize}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
            />
            <span className="slider-value">{formatting.fontSize}</span>
          </div>
        </div>

        <div className="format-group">
          <label>
            <Icon name="format_line_spacing" size={16} />
            행간
          </label>
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={formatting.lineHeight}
              onChange={(e) => handleChange('lineHeight', Number(e.target.value))}
            />
            <span className="slider-value">{formatting.lineHeight.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="format-row">
        <div className="format-group">
          <label>
            <Icon name="format_indent_increase" size={16} />
            들여쓰기
          </label>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="50"
              value={formatting.indent}
              onChange={(e) => handleChange('indent', Number(e.target.value))}
            />
            <span className="slider-value">{formatting.indent}</span>
          </div>
        </div>

        <div className="format-group">
          <label>
            <Icon name="density_medium" size={16} />
            단락
          </label>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="30"
              value={formatting.paragraphSpacing}
              onChange={(e) => handleChange('paragraphSpacing', Number(e.target.value))}
            />
            <span className="slider-value">{formatting.paragraphSpacing}</span>
          </div>
        </div>
      </div>

      <div className="format-buttons">
        <button
          className={`format-btn ${formatting.bold ? 'active' : ''}`}
          onClick={() => handleChange('bold', !formatting.bold)}
          title="굵게"
        >
          <Icon name="format_bold" size={18} />
        </button>
        <button
          className={`format-btn ${formatting.italic ? 'active' : ''}`}
          onClick={() => handleChange('italic', !formatting.italic)}
          title="기울임"
        >
          <Icon name="format_italic" size={18} />
        </button>
        <button
          className={`format-btn ${formatting.underline ? 'active' : ''}`}
          onClick={() => handleChange('underline', !formatting.underline)}
          title="밑줄"
        >
          <Icon name="format_underlined" size={18} />
        </button>
      </div>
    </div>
  );
};
