import { IconType } from "react-icons";
import { 
  FaAws, FaDocker, FaPython, FaGitAlt, FaNodeJs, 
  FaHtml5, FaCss3Alt 
} from "react-icons/fa";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiShadcnui,
  SiNestjs,
  SiGo,
  SiGraphql,
  SiPostgresql,
  SiMongodb,
  SiSupabase,
  SiFirebase,
  SiPrisma,
  SiRedis,
  SiOpenai,
  SiAnthropic,
  SiGooglecloud,
  SiVercel,
  SiVite,
  SiJest,
  SiZod,
  SiFigma,
  SiPostman,
  SiJavascript,
  SiExpress,
  SiJsonwebtokens,
  SiReactrouter,
  SiReactquery,
  SiAxios,
  SiFramer,
  SiLucide
} from "react-icons/si";

/** Tech stack icons. Updated for enhanced project visualization. */
export const TechIconMap = {
  // Frontend & Fundamentals
  FaHtml5,
  FaCss3Alt,
  SiJavascript,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiShadcnui,
  SiReactrouter,
  SiReactquery,
  SiFramer,
  SiLucide,
  // Backend & Security
  SiNestjs,
  FaNodeJs,
  SiExpress,
  SiGo,
  FaPython,
  SiGraphql,
  SiJsonwebtokens,
  SiAxios,
  // Database
  SiPostgresql,
  SiMongodb,
  SiSupabase,
  SiFirebase,
  SiPrisma,
  SiRedis,
  // AI
  SiOpenai,
  SiAnthropic,
  // Infra
  FaAws,
  SiGooglecloud,
  FaDocker,
  SiVercel,
  // Tools
  SiVite,
  SiJest,
  SiZod,
  FaGitAlt,
  SiFigma,
  SiPostman,
} as const satisfies Record<string, IconType>;

export type TechIconKey = keyof typeof TechIconMap;
export type FormTechIconKey = TechIconKey | "";