import { z } from "zod"

export const AnalysisResultSchema = z.object({
  id: z.string(),
  studentName: z.string().min(1, "학생 이름은 필수입니다"),
  uploadDate: z.string(),
  overallScore: z.number().min(0).max(100),
  careerDirection: z.string().optional(),
  careerAlignment: z
    .object({
      percentage: z.number().min(0).max(100),
      summary: z.string(),
      strengths: z.array(z.string()),
      improvements: z.array(z.string()),
    })
    .optional(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  errors: z.array(
    z.object({
      type: z.enum(["금지", "주의"]),
      content: z.string(),
      reason: z.string(),
      page: z.number(),
      suggestion: z.string().optional(),
      riskLevel: z.number().optional(),
    }),
  ),
  suggestions: z.array(z.string()),
  files: z.array(z.string()),
  likes: z.number().default(0),
  saves: z.number().default(0),
  comments: z.array(z.any()).default([]),
  userId: z.string(),
  isPrivate: z.boolean().optional(),
})

export const CommentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  content: z.string().min(1, "댓글 내용을 입력해주세요").max(500, "댓글은 500자 이내로 작성해주세요"),
  createdAt: z.string(),
  replies: z.array(z.any()).default([]),
  likes: z.number().default(0),
})

export const ShareDataSchema = z.object({
  studentId: z.string().min(1, "학번을 입력해주세요"),
  name: z.string().min(1, "이름을 입력해주세요"),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "약관에 동의해주세요",
  }),
  isPrivate: z.boolean().default(false),
})

export type ValidatedAnalysisResult = z.infer<typeof AnalysisResultSchema>
export type ValidatedComment = z.infer<typeof CommentSchema>
export type ValidatedShareData = z.infer<typeof ShareDataSchema>
