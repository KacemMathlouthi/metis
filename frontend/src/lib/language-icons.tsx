/**
 * Language icon utilities for displaying programming language logos.
 *
 * Maps programming languages to their official logos and colors.
 * Falls back to generic Code2 icon for unknown languages.
 */

import * as React from 'react';
import { Code2 } from 'lucide-react';
import {
  SiTypescript,
  SiJavascript,
  SiPython,
  SiGo,
  SiRust,
  SiRuby,
  SiPhp,
  SiCplusplus,
  SiC,
  SiSwift,
  SiKotlin,
  SiHtml5,
  SiCss3,
  SiVuedotjs,
  SiReact,
  SiShell,
  SiDocker,
} from 'react-icons/si';

/**
 * Get language icon component with official colors.
 */
export function getLanguageIcon(
  language: string | null,
  className: string = 'h-5 w-5'
): React.ReactNode {
  if (!language) return <Code2 className={`${className} text-gray-600`} />;

  const lang = language.toLowerCase();
  const iconMap: Record<string, React.ReactNode> = {
    typescript: <SiTypescript className={className} style={{ color: '#3178C6' }} />,
    javascript: <SiJavascript className={className} style={{ color: '#F7DF1E' }} />,
    python: <SiPython className={className} style={{ color: '#3776AB' }} />,
    go: <SiGo className={className} style={{ color: '#00ADD8' }} />,
    rust: <SiRust className={className} style={{ color: '#CE422B' }} />,
    ruby: <SiRuby className={className} style={{ color: '#CC342D' }} />,
    java: <Code2 className={className} style={{ color: '#007396' }} />,
    php: <SiPhp className={className} style={{ color: '#777BB4' }} />,
    'c++': <SiCplusplus className={className} style={{ color: '#00599C' }} />,
    c: <SiC className={className} style={{ color: '#A8B9CC' }} />,
    swift: <SiSwift className={className} style={{ color: '#FA7343' }} />,
    kotlin: <SiKotlin className={className} style={{ color: '#7F52FF' }} />,
    html: <SiHtml5 className={className} style={{ color: '#E34F26' }} />,
    css: <SiCss3 className={className} style={{ color: '#1572B6' }} />,
    vue: <SiVuedotjs className={className} style={{ color: '#4FC08D' }} />,
    jsx: <SiReact className={className} style={{ color: '#61DAFB' }} />,
    tsx: <SiReact className={className} style={{ color: '#61DAFB' }} />,
    shell: <SiShell className={className} style={{ color: '#4EAA25' }} />,
    dockerfile: <SiDocker className={className} style={{ color: '#2496ED' }} />,
  };

  return iconMap[lang] || <Code2 className={`${className} text-gray-600`} />;
}

/**
 * Truncate text to max length with ellipsis.
 */
export function truncateText(text: string | null, maxLength: number = 60): string {
  if (!text) return 'No description';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
