/**
 * Custom SVG tech icons for libraries not available in react-icons.
 * Each component is compatible with react-icons' IconType interface.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
};

const defaultProps = (props: IconProps): SVGProps<SVGSVGElement> => {
  const { size = "1em", color = "currentColor", style, ...rest } = props;
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    color,
    fill: color,
    style: { display: "inline-block", verticalAlign: "middle", ...style },
    ...rest,
  };
};

/**
 * Zustand — simplified bear silhouette (state management library)
 * Based on the official Zustand bear mascot, reduced to a clean monochrome shape.
 */
export const ZustandIcon = (props: IconProps) => (
  <svg {...defaultProps(props)}>
    {/* Bear ears */}
    <circle cx="8.5" cy="5.5" r="2" />
    <circle cx="15.5" cy="5.5" r="2" />
    {/* Bear head */}
    <ellipse cx="12" cy="9" rx="5.5" ry="4.5" />
    {/* Bear snout */}
    <ellipse cx="12" cy="11" rx="2.5" ry="1.8" />
    {/* Bear body */}
    <path d="M7 13.5c-2 1-3.5 3-3.5 5.5h17c0-2.5-1.5-4.5-3.5-5.5-1-.5-2-1-5-1s-4 .5-5 1z" />
    {/* Nose */}
    <ellipse cx="12" cy="10.2" rx="1" ry=".6" />
  </svg>
);

/**
 * Playwright — official Microsoft Playwright logo adapted to monochrome.
 * Original SVG: https://playwright.dev/img/playwright-logo.svg (Apache 2.0)
 * Simplified to single fill for icon usage.
 */
export const PlaywrightIcon = (props: IconProps) => (
  <svg {...defaultProps(props)} viewBox="0 0 400 400">
    <path d="M136.444 221.556C123.558 225.213 115.104 231.625 109.535 238.032C114.869 233.364 122.014 229.08 131.652 226.348C141.51 223.554 149.92 223.574 156.869 224.915V219.481C150.941 218.939 144.145 219.371 136.444 221.556ZM108.946 175.876L61.0895 188.484C61.0895 188.484 61.9617 189.716 63.5767 191.36L104.153 180.668C104.153 180.668 103.578 188.077 98.5847 194.705C108.03 187.559 108.946 175.876 108.946 175.876ZM149.005 288.347C81.6582 306.486 46.0272 228.438 35.2396 187.928C30.2556 169.229 28.0799 155.067 27.5 145.928C27.4377 144.979 27.4665 144.179 27.5336 143.446C24.04 143.657 22.3674 145.473 22.7077 150.721C23.2876 159.855 25.4633 174.016 30.4473 192.721C41.2301 233.225 76.8659 311.273 144.213 293.134C158.872 289.185 169.885 281.992 178.152 272.81C170.532 279.692 160.995 285.112 149.005 288.347ZM161.661 128.11V132.903H188.077C187.535 131.206 186.989 129.677 186.447 128.11H161.661Z" />
    <path d="M341.786 129.174C329.345 131.355 299.498 134.072 262.612 124.185C225.716 114.304 201.236 97.0224 191.537 88.8994C177.788 77.3834 171.74 69.3802 165.788 81.4857C160.526 92.163 153.797 109.54 147.284 133.866C133.171 186.543 122.623 297.706 209.867 321.098C297.093 344.47 343.53 242.92 357.644 190.238C364.157 165.917 367.013 147.5 367.799 135.625C368.695 122.173 359.455 126.078 341.786 129.174ZM166.497 172.756C166.497 172.756 180.246 151.372 203.565 158C226.899 164.628 228.706 190.425 228.706 190.425L166.497 172.756ZM223.42 268.713C182.403 256.698 176.077 223.99 176.077 223.99L286.262 254.796C286.262 254.791 264.021 280.578 223.42 268.713ZM262.377 201.495C262.377 201.495 276.107 180.126 299.422 186.773C322.736 193.411 324.572 219.208 324.572 219.208L262.377 201.495Z" />
    <path d="M161.661 262.296V239.863L99.3324 257.537C99.3324 257.537 103.938 230.777 136.444 221.556C146.302 218.762 154.713 218.781 161.661 220.123V128.11H192.869C189.471 117.61 186.184 109.526 183.423 103.909C178.856 94.612 174.174 100.775 163.545 109.665C156.059 115.919 137.139 129.261 108.668 136.933C80.1966 144.61 57.179 142.574 47.5752 140.911C33.9601 138.562 26.8387 135.572 27.5049 145.928C28.0847 155.062 30.2605 169.224 35.2445 187.928C46.0272 228.433 81.663 306.481 149.01 288.342C166.602 283.602 179.019 274.233 187.626 262.291H161.661V262.296ZM61.0848 188.484L108.946 175.876C108.946 175.876 107.551 194.288 89.6087 199.018C71.6614 203.743 61.0848 188.484 61.0848 188.484Z" />
  </svg>
);

/**
 * Dexie.js — stylized "D" lettermark icon representing the IndexedDB wrapper.
 * Custom design inspired by the Dexie.js brand color and initial.
 */
export const DexieIcon = (props: IconProps) => (
  <svg {...defaultProps(props)}>
    <rect x="3" y="2" width="14" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M7 7h4.5a5 5 0 0 1 0 10H7V7z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <line x1="7" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * PDF.js — document-with-text icon representing Mozilla's PDF rendering library.
 * Custom design as PDF.js has no official SVG icon.
 */
export const PdfJsIcon = (props: IconProps) => (
  <svg {...defaultProps(props)}>
    {/* Document shape with folded corner */}
    <path
      d="M4 2h10l4 4v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Folded corner */}
    <path
      d="M14 2v4h4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* "PDF" text lines */}
    <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7" y1="13.5" x2="17" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
