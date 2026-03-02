import { z } from "zod";

// --- Profile Schema ---
export const profileSettingsSchema = z.object({
  siteTitle: z.string().default(""),
  siteDescription: z.string().default(""),
  name: z.string().default(""),
  tagline: z.string().default(""),
  aboutMeHeading: z.string().default(""),
  aboutMeText: z.string().default(""),
  linkedinUrl: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .default(""),
  githubUrl: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .default(""),
  emailAddress: z
    .string()
    .email("Please enter a valid email address")
    .or(z.literal(""))
    .default(""),
  welcomeMessageHeading: z.string().default(""),
  welcomeMessageText: z.string().default(""),
});

// --- Project Helper Schemas ---
export const projectMediaSchema = z.object({
  type: z.enum(["image", "video", "youtube"]),
  url: z.string().url("Please enter a valid media URL").or(z.literal("")),
});

export const projectSectionSchema = z.object({
  heading: z.string().default(""),
  content: z.string().default(""),
  media: z.array(projectMediaSchema).default([]),
});

// --- Main Project Schema ---
export const projectSchema = z.object({
  id: z.string(),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]*$/,
      "Only lowercase letters, numbers, and hyphens are allowed"
    )
    .default(""),
  title: z.string().default(""),
  category: z.array(z.string()).default([]),
  industry: z.string().default(""),
  summary: z.string().default(""),
  imageSrc: z
    .string()
    .url("Please enter a valid image URL")
    .or(z.literal(""))
    .default(""),
  githubUrl: z
    .string()
    .url("Please enter a valid GitHub URL")
    .or(z.literal(""))
    .default(""),
  demoUrl: z
    .string()
    .url("Please enter a valid demo URL")
    .or(z.literal(""))
    .default(""),
  techStack: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  is_deleted: z.boolean().default(false),
  sections: z.array(projectSectionSchema).default([]),
  showDetail: z.boolean().default(true),
  updatedAt: z.number().optional(),
});
