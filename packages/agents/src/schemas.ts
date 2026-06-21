import { z } from "zod";

export const ListenerResponseSchema = z.object({
  agent_message: z.string(),
  needs_more: z.boolean().default(false),
});

export type ListenerResponse = z.infer<typeof ListenerResponseSchema>;

export const RiskAssessmentSchema = z.object({
  should_escalate: z.boolean(),
  reason: z.string().nullable(),
  triggers: z.array(z.string()),
});

export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

export const ConfirmationResultSchema = z.object({
  accepted: z.boolean(),
  message: z.string(),
});

export type ConfirmationResult = z.infer<typeof ConfirmationResultSchema>;

export const ChildSideSchema = z.object({
  label: z.string(),
  facts: z.array(z.string()).default([]),
  feelings: z.array(z.string()).default([]),
  unknowns: z.array(z.string()).default([]),
});

export type ChildSide = z.infer<typeof ChildSideSchema>;

export const TimelineEventSchema = z.object({
  at: z.string(),
  event: z.string(),
});

export const StructuredFactsSchema = z.object({
  child_a: ChildSideSchema,
  child_b: ChildSideSchema,
  agreements: z.array(z.string()).default([]),
  disagreements: z.array(z.string()).default([]),
  unknowns: z.array(z.string()).default([]),
});

export type StructuredFacts = z.infer<typeof StructuredFactsSchema>;

export const ConversationSideSchema = z.object({
  label: z.string(),
  utterances: z.array(z.string()).default([]),
});

export type ConversationSide = z.infer<typeof ConversationSideSchema>;

export const SessionInsightsSchema = z.object({
  agreements: z.array(z.string()).default([]),
  disagreements: z.array(z.string()).default([]),
  unknowns: z.array(z.string()).default([]),
  teacher_hints: z.array(z.string()).default([]),
});

export type SessionInsights = z.infer<typeof SessionInsightsSchema>;

export const TeacherBriefSchema = z.object({
  session_id: z.string(),
  urgent: z.boolean().default(false),
  ai_disclaimer: z.string(),
  timeline: z.array(TimelineEventSchema).default([]),
  conversation_a: ConversationSideSchema,
  conversation_b: ConversationSideSchema,
  child_a: ChildSideSchema,
  child_b: ChildSideSchema,
  agreements: z.array(z.string()).default([]),
  disagreements: z.array(z.string()).default([]),
  unknowns: z.array(z.string()).default([]),
  suggested_questions: z.array(z.string()).default([]),
  teacher_hints: z.array(z.string()).default([]),
});

export type TeacherBrief = z.infer<typeof TeacherBriefSchema>;
