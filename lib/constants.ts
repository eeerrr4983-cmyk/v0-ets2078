export const APP_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  SUPPORTED_FILE_TYPES: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
  MAX_COMMENT_LENGTH: 500,
  MAX_REPLY_LENGTH: 300,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
} as const

export const STORAGE_KEYS = {
  ANALYSES: "saenggibu_analyses",
  AGENTS: "huntfire_agents",
  INTERACTION: "huntfire_interaction",
  SESSION_ID: "user_session_id",
  STUDENT_ID: "student_id",
  STUDENT_NAME: "student_name",
  CURRENT_ANALYSIS: "current_analysis",
  IS_ANALYZING: "is_analyzing",
  USER_DISPLAY_NUMBER: "user_display_number",
} as const

export const PROGRESS_TIPS = [
  "구체적 활동 내용이 생기부의 핵심이에요.",
  "진로 연계성이 대학 평가의 중요 요소예요.",
  "수상은 의미있는 것만 선별하세요.",
  "지속적인 봉사가 진정성을 보여줘요.",
  "전공 관련 독서가 학업 열정을 드러내요.",
] as const

export const PROGRESS_MESSAGES = {
  uploading: ["파일을 업로드하는 중이에요."],
  ocr: [
    "AI가 생기부를 읽어보고 있어요.",
    "텍스트를 정밀하게 추출하는 중이에요.",
    "생기부 내용을 분석하고 있어요.",
    "문서 구조를 파악하는 중이에요.",
  ],
  analyzing: [
    "AI가 정밀하게 탐지하는 중이에요.",
    "오류를 검사하고 있어요.",
    "강점과 보완점을 찾고 있어요.",
    "종합 평가를 계산하는 중이에요.",
  ],
} as const

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: "파일 크기는 10MB 이하여야 합니다.",
  INVALID_FILE_TYPE: "지원하지 않는 파일 형식입니다.",
  TOO_MANY_FILES: "최대 5개의 파일만 업로드할 수 있습니다.",
  COMMENT_TOO_LONG: "댓글은 500자 이내로 작성해주세요.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다.",
  STORAGE_FULL: "저장 공간이 부족합니다.",
  GUEST_RESTRICTION: "회원만 사용할 수 있는 기능입니다.",
} as const
