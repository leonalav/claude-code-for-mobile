import type { ComponentType, SVGProps } from "react";
import type { JSX } from "react";

/**
 * Real language/file-type icons rendered as inline SVGs.
 *
 * Each icon is a 24×24 viewbox rounded-square badge with the official
 * language color and a tiny mark. We keep them simple so they render
 * crisp at 16px-22px inside chips and list rows.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Strong component type so TS doesn't try to interpret object keys as
 * intrinsic JSX elements.
 */
type IconComponent = ComponentType<IconProps>;

function badge(
  color: string,
  mark: React.ReactNode,
  props: IconProps,
): JSX.Element {
  const { size = 18, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect width="24" height="24" rx="5" fill={color} />
      {mark}
    </svg>
  );
}

function textMark(label: string, color = "#fff"): JSX.Element {
  return (
    <text
      x="12"
      y="16.5"
      textAnchor="middle"
      fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
      fontSize={label.length > 2 ? 7.5 : 9.5}
      fontWeight={700}
      fill={color}
      letterSpacing={label.length > 1 ? "-0.3" : "0"}
    >
      {label}
    </text>
  );
}

function shapeMark(path: React.ReactNode): JSX.Element {
  return <g>{path}</g>;
}

export const FileIcons: Record<string, IconComponent> = {
  ts: (p) => badge("#3178C6", textMark("TS"), p),
  tsx: (p) => badge("#3178C6", textMark("TSX"), p),
  js: (p) => badge("#F7DF1E", textMark("JS", "#141413"), p),
  jsx: (p) => badge("#F7DF1E", textMark("JSX", "#141413"), p),
  py: (p) => badge("#3776AB", textMark("PY"), p),
  go: (p) => badge("#00ADD8", textMark("GO"), p),
  rs: (p) => badge("#000000", textMark("RS", "#F7A41D"), p),
  rb: (p) => badge("#CC342D", textMark("RB"), p),
  php: (p) => badge("#777BB4", textMark("PHP"), p),
  java: (p) => badge("#E76F00", textMark("JV", "#fff"), p),
  kt: (p) => badge("#7F52FF", textMark("KT"), p),
  swift: (p) => badge("#F05138", textMark("SW"), p),
  c: (p) => badge("#283593", textMark("C"), p),
  cpp: (p) => badge("#00599C", textMark("C++"), p),
  cs: (p) => badge("#239120", textMark("C#"), p),
  html: (p) =>
    badge(
      "#E34F26",
      shapeMark(
        <>
          <path d="M5 4h14l-1.4 13.4L12 20l-5.6-2.6L5 4z" fill="#F06529" />
          <path d="M12 6.5v11l4.2-1.9.9-9.1H12z" fill="#EBEBEB" />
          <path d="M12 11h-2l-.2-1.7H12V7.8H8l.5 4.8H12V11z" fill="#fff" />
          <path
            d="M12 14.7v1.7l-2-.9-.1-1.5H8l.2 2.5L12 18.2v-1.7z"
            fill="#fff"
          />
        </>,
      ),
      p,
    ),
  css: (p) =>
    badge(
      "#1572B6",
      shapeMark(
        <>
          <path d="M5 4h14l-1.4 13.4L12 20l-5.6-2.6L5 4z" fill="#1572B6" />
          <path d="M12 6.5v11l4.2-1.9.9-9.1H12z" fill="#EBEBEB" />
          <path d="M12 11h-2l-.2-1.7H12V7.8H8l.5 4.8H12V11z" fill="#fff" />
          <path
            d="M12 14.7v17l-2-.9-.1-1.5H8l.2 2.5L12 18.2v-1.7z"
            fill="#fff"
          />
        </>,
      ),
      p,
    ),
  scss: (p) => badge("#C69", textMark("S", "#fff"), p),
  json: (p) =>
    badge(
      "#292929",
      shapeMark(
        <>
          <path
            d="M9 4c-2.2 0-4 1.6-4 4v3c0 1-.8 1.8-2 1.8 1.2 0 2 .8 2 1.8v3c0 2.4 1.8 4 4 4"
            stroke="#FFD43B"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M15 4c2.2 0 4 1.6 4 4v3c0 1 .8 1.8 2 1.8-1.2 0-2 .8-2 1.8v3c0 2.4-1.8 4-4 4"
            stroke="#FFD43B"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </>,
      ),
      p,
    ),
  md: (p) => badge("#083FA1", textMark("MD"), p),
  yml: (p) => badge("#CB171E", textMark("Y"), p),
  toml: (p) => badge("#9C4221", textMark("TOML"), p),
  txt: (p) => badge("#6B7280", textMark("TXT"), p),
  sh: (p) => badge("#4EAA25", textMark("SH"), p),
  lock: (p) =>
    badge(
      "#0E1116",
      shapeMark(
        <path
          d="M8 11V7a4 4 0 1 1 8 0v4M6 11h12v8H6z"
          stroke="#F0B232"
          strokeWidth="1.6"
          fill="none"
          strokeLinejoin="round"
        />,
      ),
      p,
    ),
  docker: (p) =>
    badge(
      "#0DB7ED",
      shapeMark(
        <>
          <rect x="4" y="13" width="3" height="2.5" fill="#fff" />
          <rect x="7.5" y="13" width="3" height="2.5" fill="#fff" />
          <rect x="11" y="13" width="3" height="2.5" fill="#fff" />
          <rect x="14.5" y="13" width="3" height="2.5" fill="#fff" />
          <rect x="7.5" y="10" width="3" height="2.5" fill="#fff" />
          <rect x="11" y="10" width="3" height="2.5" fill="#fff" />
          <rect x="14.5" y="10" width="3" height="2.5" fill="#fff" />
          <rect x="11" y="7" width="3" height="2.5" fill="#fff" />
          <path
            d="M3 14c.7 3.5 3.5 5 7 5h7c3 0 5.5-2 6-5-1.5-.4-3 .2-4 1-1-3-4.5-4-7-3-.5-1.5-2-2.5-3.5-2.5C5 9.5 3 12 3 14z"
            fill="#fff"
          />
        </>,
      ),
      p,
    ),
  db: (p) => badge("#336790", textMark("SQL"), p),
  svg: (p) =>
    badge(
      "#FFB13B",
      shapeMark(
        <>
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="#141413"
            strokeWidth="1.6"
          />
          <path
            d="M5 9c3 0 5 1.5 7 4M19 9c-3 0-5 1.5-7 4M5 15c3 0 5-1.5 7-4"
            stroke="#141413"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </>,
      ),
      p,
    ),
  png: (p) =>
    badge(
      "#7F7F7F",
      shapeMark(
        <path
          d="M5 4h14v16H5z"
          fill="none"
          stroke="#fff"
          strokeWidth="1.4"
        />,
      ),
      p,
    ),
  jpg: (p) =>
    badge(
      "#7F7F7F",
      shapeMark(
        <path
          d="M5 4h14v16H5z"
          fill="none"
          stroke="#fff"
          strokeWidth="1.4"
        />,
      ),
      p,
    ),
  generic: (p) =>
    badge(
      "#94A3B8",
      shapeMark(
        <>
          <path
            d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3z"
            fill="none"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M13 3v5h5"
            fill="none"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </>,
      ),
      p,
    ),
  folder: (p) =>
    badge(
      "#D8A45E",
      shapeMark(
        <path
          d="M3 7.5A2 2 0 0 1 5 5.5h4l2 2h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5z"
          fill="#fff"
        />,
      ),
      p,
    ),
};

export type FileKind = keyof typeof FileIcons;

const EXT_MAP: Record<string, FileKind> = {
  ts: "ts",
  tsx: "tsx",
  js: "js",
  jsx: "jsx",
  mjs: "js",
  cjs: "js",
  py: "py",
  go: "go",
  rs: "rs",
  rb: "rb",
  php: "php",
  java: "java",
  kt: "kt",
  kts: "kt",
  swift: "swift",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  cs: "cs",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  sass: "scss",
  json: "json",
  jsonc: "json",
  md: "md",
  mdx: "md",
  yml: "yml",
  yaml: "yml",
  toml: "toml",
  txt: "txt",
  sh: "sh",
  bash: "sh",
  zsh: "sh",
  sql: "db",
  dockerfile: "docker",
  png: "png",
  jpg: "jpg",
  jpeg: "jpg",
  gif: "png",
  webp: "png",
  svg: "svg",
};

const LANG_OVERRIDE: Record<string, FileKind> = {
  Dockerfile: "docker",
  Makefile: "sh",
  ".gitignore": "generic",
  ".env": "lock",
  ".env.example": "generic",
};

/**
 * Resolve a filename to the icon kind. Falls back to "generic".
 */
export function iconForFile(name: string): FileKind {
  const override = LANG_OVERRIDE[name];
  if (override) return override;
  if (!name.includes(".")) return "generic";
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return (EXT_MAP[ext] as FileKind | undefined) ?? "generic";
}

/**
 * Resolve a filename directly to an icon component.
 */
export function iconComponentForFile(name: string): IconComponent {
  return FileIcons[iconForFile(name)];
}

export function iconForKind(kind: FileKind): IconComponent {
  return FileIcons[kind];
}