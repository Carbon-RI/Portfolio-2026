import { IconType } from "react-icons";
import { FaAws, FaDocker, FaPython, FaGitAlt, FaNodeJs } from "react-icons/fa";
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
} from "react-icons/si";

/** Tech stack icons. Categories for reference:
 * Frontend: React, Next.js, TypeScript, Tailwind CSS, shadcn/ui
 * Backend: NestJS, Node.js, Go, Python, GraphQL
 * Database: PostgreSQL, MongoDB, Supabase, Firebase, Prisma, Redis
 * AI: OpenAI, Anthropic
 * Infra: AWS, Google Cloud, Docker, Vercel
 * Tools: Vite, Jest, Zod, Git, Figma, Postman
 */
export const TechIconMap = {
  // Frontend
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiShadcnui,
  // Backend
  SiNestjs,
  FaNodeJs,
  SiGo,
  FaPython,
  SiGraphql,
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
