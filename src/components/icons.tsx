import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const PlayIcon: React.FC<IconProps> = ({ size = 22, color }) => {
  const theme = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8 5.14v13.72c0 .83.9 1.34 1.62.92l11.1-6.86a1.06 1.06 0 0 0 0-1.84L9.62 4.22A1.06 1.06 0 0 0 8 5.14Z"
        fill={color ?? theme.text}
      />
    </Svg>
  );
};

export const PauseIcon: React.FC<IconProps> = ({ size = 22, color }) => {
  const theme = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 4h3.2v16H7zM13.8 4H17v16h-3.2z" fill={color ?? theme.text} />
    </Svg>
  );
};

export const PrevIcon: React.FC<IconProps> = ({ size = 22, color }) => {
  const theme = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 4h2.2v16H6zM19 5.4v13.2c0 .84-.92 1.35-1.63.9l-9.1-6.6a1.07 1.07 0 0 1 0-1.8l9.1-6.6c.71-.45 1.63.06 1.63.9Z"
        fill={color ?? theme.text}
      />
    </Svg>
  );
};

export const NextIcon: React.FC<IconProps> = ({ size = 22, color }) => {
  const theme = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M15.8 4H18v16h-2.2zM5 5.4v13.2c0 .84.92 1.35 1.63.9l9.1-6.6a1.07 1.07 0 0 0 0-1.8l-9.1-6.6C5.92 4.05 5 4.56 5 5.4Z"
        fill={color ?? theme.text}
      />
    </Svg>
  );
};

export const HeartIcon: React.FC<IconProps & { filled?: boolean }> = ({ size = 14, color, filled = false }) => {
  const theme = useTheme();
  const stroke = color ?? theme.muted;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 20.3 3.9 12.6A5.1 5.1 0 0 1 12 5.6a5.1 5.1 0 0 1 8.1 7l-8.1 7.7Z"
        fill={filled ? stroke : 'none'}
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ShareIcon: React.FC<IconProps> = ({ size = 14, color }) => {
  const theme = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 15V3m0 0L8 7m4-4 4 4M4 14v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6"
        fill="none"
        stroke={color ?? theme.muted}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ClockIcon: React.FC<IconProps> = ({ size = 14, color }) => {
  const theme = useTheme();
  const stroke = color ?? theme.muted;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 7v5l3.5 2" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" fill="none" stroke={stroke} strokeWidth={2} />
    </Svg>
  );
};