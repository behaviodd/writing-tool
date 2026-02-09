import './Icon.css';

interface IconProps {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Icon = ({
  name,
  size = 24,
  filled = false,
  className = '',
  onClick,
}: IconProps) => {
  return (
    <span
      className={`material-symbols-rounded icon ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
      onClick={onClick}
    >
      {name}
    </span>
  );
};
