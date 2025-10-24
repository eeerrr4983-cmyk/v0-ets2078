/**
 * Gemini AI Service for 생기부 (Student Record) Analysis
 * Uses Gemini 2.5 Flash-Lite for comprehensive analysis
 */

import { AnalysisResult } from './types'

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyBLi15a14bzr2vlp41in_81PqkF2pv1-d4'
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent'

/**
 * 생기부 분석을 위한 프롬프트 생성
 */
function createAnalysisPrompt(text: string, careerDirection: string): string {
  return `당신은 대한민국 교육부의 2025년 학교생활기록부 세부능력 및 특기사항 작성 지침을 완벽하게 숙지한 전문 생기부 검토 AI입니다.

다음 생기부 텍스트를 분석하여 기재 금지 및 주의 사항을 탐지하고, 개선 방안을 제시해주세요.

**학생 진로 방향**: ${careerDirection || '미지정'}

**생기부 텍스트**:
\`\`\`
${text}
\`\`\`

다음 형식으로 분석해주세요:

1. **전체 평가 점수** (0-100점): 현재 생기부의 완성도
2. **탐지된 문제점들** (최소 3개 이상):
   - 문제 제목
   - 위험도 (높음/중간/낮음)
   - 구체적 설명
   - 해당 원문 인용
   - 수정 제안

3. **강점 분석** (최소 3개):
   - 잘 작성된 부분
   - 이유
   - 활용 방안

4. **개선 권장사항** (최소 5개):
   - 우선순위별 개선 사항
   - 구체적 action item

5. **종합 의견**:
   - 전반적 평가
   - 핵심 개선 방향

**중요**: 2025년 교육부 훈령 제530호 기준을 엄격히 적용하여 다음 항목을 반드시 검토하세요:
- 대학명, 기관명, 상호 언급
- 공인어학시험, 인증시험
- 모의고사 성적
- 교외 대회/상
- 온라인 강의 플랫폼
- 특허/논문/출판
- 정량 성적 오기재
- 모호한 칭찬 표현
- 교과 무관 내용

응답은 반드시 JSON 형식으로 작성하세요.`
}

/**
 * Gemini API를 호출하여 생기부 분석 수행
 */
export async function analyzeSaenggibu(
  text: string,
  careerDirection: string,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> {
  try {
    onProgress?.(10)

    const prompt = createAnalysisPrompt(text, careerDirection)
    
    onProgress?.(30)

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
          }
        ]
      }),
    })

    onProgress?.(60)

    if (!response.ok) {
      throw new Error(`Gemini API 오류: ${response.status}`)
    }

    const data = await response.json()
    
    onProgress?.(80)

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Parse JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다')
    }

    const analysis = JSON.parse(jsonMatch[0])
    
    onProgress?.(100)

    // Convert to AnalysisResult format
    return {
      overallScore: analysis.전체평가점수 || analysis.overallScore || 75,
      errors: (analysis.탐지된문제점들 || analysis.errors || []).map((error: any, index: number) => ({
        id: `error-${index}`,
        title: error.문제제목 || error.title || '문제점',
        severity: mapSeverity(error.위험도 || error.severity || '중간'),
        description: error.구체적설명 || error.description || '',
        location: error.해당원문인용 || error.location || '',
        suggestion: error.수정제안 || error.suggestion || '',
        category: categorizeError(error.문제제목 || error.title || ''),
      })),
      strengths: (analysis.강점분석 || analysis.strengths || []).map((strength: any) => ({
        title: strength.잘작성된부분 || strength.title || '강점',
        description: strength.이유 || strength.description || '',
        utilization: strength.활용방안 || strength.utilization || '',
      })),
      recommendations: (analysis.개선권장사항 || analysis.recommendations || []).map((rec: any) => ({
        priority: rec.우선순위 || rec.priority || '중',
        item: rec.개선사항 || rec.item || '',
        action: rec.action || '',
      })),
      summary: analysis.종합의견 || analysis.summary || {
        overall: '생기부가 전반적으로 잘 작성되었습니다.',
        keyPoints: ['지속적인 개선이 필요합니다.']
      },
      timestamp: new Date().toISOString(),
      studentInfo: {
        careerDirection: careerDirection || '미지정',
      }
    }
  } catch (error) {
    console.error('[Gemini Analysis Error]', error)
    throw new Error(
      error instanceof Error 
        ? `AI 분석 실패: ${error.message}` 
        : 'AI 분석 중 오류가 발생했습니다'
    )
  }
}

/**
 * 위험도 매핑
 */
function mapSeverity(severity: string): 'high' | 'medium' | 'low' {
  const normalized = severity.toLowerCase()
  if (normalized.includes('높') || normalized.includes('high')) return 'high'
  if (normalized.includes('낮') || normalized.includes('low')) return 'low'
  return 'medium'
}

/**
 * 에러 카테고리 분류
 */
function categorizeError(title: string): string {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes('대학') || lowerTitle.includes('기관')) return '기관명'
  if (lowerTitle.includes('시험') || lowerTitle.includes('인증')) return '시험/인증'
  if (lowerTitle.includes('성적') || lowerTitle.includes('등급')) return '성적'
  if (lowerTitle.includes('대회') || lowerTitle.includes('수상')) return '교외활동'
  if (lowerTitle.includes('칭찬') || lowerTitle.includes('모호')) return '표현'
  
  return '기타'
}

/**
 * AI 작성 탐지 분석 (별도 기능)
 */
export async function detectAIWriting(text: string): Promise<{
  isAIGenerated: boolean
  confidence: number
  indicators: string[]
  recommendations: string[]
}> {
  try {
    const prompt = `다음 텍스트가 AI로 작성되었을 가능성을 분석해주세요:

\`\`\`
${text}
\`\`\`

다음 형식으로 JSON으로 응답해주세요:
{
  "isAIGenerated": true/false,
  "confidence": 0-100,
  "indicators": ["지표1", "지표2"],
  "recommendations": ["권장사항1", "권장사항2"]
}`

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        }
      }),
    })

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('AI 응답 파싱 실패')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('[AI Detection Error]', error)
    return {
      isAIGenerated: false,
      confidence: 0,
      indicators: [],
      recommendations: ['분석을 완료할 수 없습니다.']
    }
  }
}
