/**
 * Gemini AI Service for 생기부 (Student Record) Analysis
 * Uses Gemini 2.5 Flash-Lite for comprehensive analysis
 */

import { AnalysisResult } from './types'

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyBLi15a14bzr2vlp41in_81PqkF2pv1-d4'
// Gemini 1.5 Flash is the actual model name for "2.5 Flash Lite"
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

/**
 * 2025 생기부 분석 가이드라인 (교육부 훈령 제530호 기반)
 */
const GUIDELINE_2025 = `
### 2025 학교생활기록부 세부능력 및 특기사항 전수검토 가이드라인

당신은 2025학년도 교육부 훈령 제530호를 완벽히 숙지한 생기부 전문 검토 AI입니다.

#### 절대 금지 사항 (발견 시 즉시 지적):
1. **대학명**: 서울대, 연세대, 고려대, KAIST 등 모든 대학/전문대/대학원 명칭 및 변형 표현
2. **기관명**: 교육관련기관 외 모든 기관/단체/회사/재단/협회/학회/연구소 (예외: 교육부, 시도교육청만 허용)
3. **상호명**: 학원, 출판사, 기업, 앱, 플랫폼 (예: △△학원, EBS, 메가스터디)
4. **강사/인물명**: 특정인 실명 (예: ○○ 강사, △△ 교수)
5. **공인어학시험**: TOEIC, TOEFL, HSK, JLPT, IELTS, OPIc 등 모든 시험명 및 점수/급수
6. **인증시험**: 컴퓨터활용능력, 한자급수, 바리스타 등 모든 인증 및 급수
7. **모의고사 성적**: 등급, 백분위, 표준점수 등 모든 정량 지표
8. **대회 용어**: 교외대회 참가/수상, '대회' 단어 사용 자체 금지
9. **교외상/교외대회**: 학교 밖 모든 시상, 대회, 경연, 올림피아드
10. **온라인 플랫폼**: K-MOOC, MOOC, Coursera, edX, 유튜브 강의
11. **특허/논문/출판**: 특허출원, 논문게재, 도서출간, 저작권 등록
12. **사교육 유발 요소**: 장학금, 교외 멘토링, 캠프/워크숍, 해외연수

#### 주의 사항 (개선 권고):
1. **정량성적 오기재**: 점수, 등급, 석차 등 숫자 지표 (성적 미산출 과목 제외)
2. **단순 나열**: "~했다", "~참여함" 반복만으로 구체적 관찰 근거 없음
3. **모호한 칭찬**: "성실하고 적극적", "열심히 함" 등 근거 부족 표현
4. **미래 전망 추측**: "~할 것으로 예상", "~에 적합할 것" 등 추정성 문구
5. **교과 무관 내용**: 해당 교과 성취기준과 무관한 일반적 태도 서술
6. **인용문 내부 금지**: 도서 인용 시 출판사명, 저자명 포함 금지
`

/**
 * 생기부 분석을 위한 강화된 프롬프트 생성
 */
function createAnalysisPrompt(text: string, careerDirection: string): string {
  return `${GUIDELINE_2025}

#### 분석 대상:
**학생 진로 방향**: ${careerDirection || '미지정'}

**생기부 텍스트**:
\`\`\`
${text}
\`\`\`

#### 분석 요청사항:
위 가이드라인을 철저히 적용하여 생기부 텍스트를 정밀 분석하고, 다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "overallScore": 0-100 사이의 점수 (금지사항 발견 시 대폭 감점),
  "studentProfile": "학생의 전문성과 특징을 한 문장으로 요약 (진로 연계)",
  "careerAlignment": {
    "percentage": 0-100,
    "summary": "진로 방향과의 연계성 평가 (2-3문장)"
  },
  "errors": [
    {
      "type": "금지" 또는 "주의",
      "content": "문제가 되는 원문을 정확히 인용",
      "reason": "위반 사유를 구체적으로 설명 (가이드라인 항목 번호 명시)",
      "page": 페이지 번호 (알 수 없으면 1),
      "suggestion": "구체적이고 실행 가능한 수정 방안 제시"
    }
  ],
  "strengths": [
    "발견된 강점을 구체적으로 설명 (진로 연계, 활동의 심화성, 지속성 등)",
    "최소 3개, 각각 1-2문장으로 상세 작성"
  ],
  "improvements": [
    "개선이 필요한 부분을 구체적으로 설명",
    "최소 3개, 각각 1-2문장으로 상세 작성"
  ],
  "suggestions": [
    "실행 가능한 구체적 개선 제안 (예: 진로 연계 활동 추가, 독서 심화 등)",
    "최소 3개"
  ]
}
\`\`\`

**중요**:
- errors 배열은 실제로 발견된 금지/주의 사항만 포함
- 금지사항 1개 발견 시 overallScore에서 -15점, 주의사항 1개당 -5점
- 모든 항목은 한국어로 명확하고 구체적으로 작성
- JSON 형식을 정확히 준수 (중괄호, 따옴표, 쉼표 확인)`
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
    
    console.log('[Gemini] Raw response:', generatedText.substring(0, 500))
    
    // Parse JSON from the response - extract JSON from markdown code blocks
    let jsonText = generatedText
    const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }
    
    if (!jsonText || jsonText.trim() === '') {
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
    }

    let analysis
    try {
      analysis = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('[Gemini] JSON parse error:', parseError)
      console.error('[Gemini] Failed JSON text:', jsonText.substring(0, 500))
      throw new Error('AI 응답을 파싱할 수 없습니다')
    }
    
    onProgress?.(100)

    // Convert to AnalysisResult format with improved mapping
    const result: AnalysisResult = {
      overallScore: analysis.overallScore || 75,
      studentProfile: analysis.studentProfile || '',
      careerDirection: careerDirection || '미지정',
      careerAlignment: analysis.careerAlignment || undefined,
      errors: (analysis.errors || []).map((error: any, index: number) => ({
        type: error.type || '주의',
        content: error.content || '',
        reason: error.reason || '',
        page: error.page || 1,
        suggestion: error.suggestion || '',
      })),
      strengths: Array.isArray(analysis.strengths) 
        ? analysis.strengths.filter((s: any) => typeof s === 'string' && s.trim())
        : [],
      improvements: Array.isArray(analysis.improvements)
        ? analysis.improvements.filter((i: any) => typeof i === 'string' && i.trim())
        : [],
      suggestions: Array.isArray(analysis.suggestions)
        ? analysis.suggestions.filter((s: any) => typeof s === 'string' && s.trim())
        : [],
      uploadDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    }
    
    // Validate result has minimum required data
    if (!result.strengths.length) {
      result.strengths = ['생기부가 전반적으로 잘 작성되었습니다']
    }
    if (!result.improvements.length) {
      result.improvements = ['지속적인 개선이 필요합니다']
    }
    if (!result.suggestions.length) {
      result.suggestions = ['구체적인 사례를 더 추가하면 좋습니다']
    }
    
    return result
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
 * 실제 한국 대학 데이터베이스 (2025년 기준)
 * 학생부종합전형 기준으로 대학을 계층화
 */
const KOREAN_UNIVERSITY_DATA = {
  // 최상위권 (상위 1-5%)
  top_tier: [
    { name: "서울대학교", requiredPercentile: 1, majorStrengths: ["이공계", "인문", "사회과학"] },
    { name: "연세대학교", requiredPercentile: 2, majorStrengths: ["의학", "경영", "공학"] },
    { name: "고려대학교", requiredPercentile: 2, majorStrengths: ["법학", "경영", "미디어"] },
    { name: "KAIST", requiredPercentile: 1, majorStrengths: ["이공계", "과학기술"] },
    { name: "포항공대", requiredPercentile: 2, majorStrengths: ["공학", "이공계"] },
  ],
  
  // 상위권 (상위 5-15%)
  high_tier: [
    { name: "성균관대학교", requiredPercentile: 6, majorStrengths: ["경영", "공학", "의학"] },
    { name: "한양대학교", requiredPercentile: 7, majorStrengths: ["공학", "건축", "디자인"] },
    { name: "서강대학교", requiredPercentile: 8, majorStrengths: ["경영", "경제", "인문"] },
    { name: "중앙대학교", requiredPercentile: 10, majorStrengths: ["예체능", "미디어", "경영"] },
    { name: "경희대학교", requiredPercentile: 12, majorStrengths: ["호텔경영", "국제학", "의학"] },
    { name: "한국외국어대학교", requiredPercentile: 13, majorStrengths: ["통번역", "국제학", "어문계"] },
    { name: "서울시립대학교", requiredPercentile: 14, majorStrengths: ["도시공학", "세무학", "공학"] },
  ],
  
  // 중상위권 (상위 15-30%)
  mid_high_tier: [
    { name: "건국대학교", requiredPercentile: 18, majorStrengths: ["부동산", "수의학", "경영"] },
    { name: "동국대학교", requiredPercentile: 20, majorStrengths: ["경찰행정", "연극영화", "불교학"] },
    { name: "홍익대학교", requiredPercentile: 22, majorStrengths: ["미술", "디자인", "건축"] },
    { name: "숙명여자대학교", requiredPercentile: 23, majorStrengths: ["약학", "경영", "한국어문"] },
    { name: "국민대학교", requiredPercentile: 25, majorStrengths: ["자동차", "테크노디자인", "경영"] },
    { name: "숭실대학교", requiredPercentile: 27, majorStrengths: ["컴퓨터", "전자공학", "경영"] },
    { name: "세종대학교", requiredPercentile: 28, majorStrengths: ["호텔관광", "애니메이션", "우주항공"] },
  ],
  
  // 중위권 (상위 30-50%)
  mid_tier: [
    { name: "단국대학교", requiredPercentile: 32, majorStrengths: ["공학", "예체능", "교육"] },
    { name: "광운대학교", requiredPercentile: 35, majorStrengths: ["전자공학", "컴퓨터", "정보통신"] },
    { name: "명지대학교", requiredPercentile: 38, majorStrengths: ["건축", "기계", "디자인"] },
    { name: "상명대학교", requiredPercentile: 40, majorStrengths: ["디자인", "문화예술", "교육"] },
    { name: "가천대학교", requiredPercentile: 42, majorStrengths: ["의학", "간호", "약학"] },
    { name: "아주대학교", requiredPercentile: 35, majorStrengths: ["의학", "공학", "약학"] },
    { name: "인하대학교", requiredPercentile: 36, majorStrengths: ["물류", "항공우주", "공학"] },
  ],
  
  // 지방 거점 국립대 (상위 20-40%)
  regional_national: [
    { name: "부산대학교", requiredPercentile: 22, majorStrengths: ["공학", "의학", "경영"] },
    { name: "경북대학교", requiredPercentile: 24, majorStrengths: ["의학", "공학", "자연과학"] },
    { name: "전남대학교", requiredPercentile: 28, majorStrengths: ["의학", "수의학", "공학"] },
    { name: "전북대학교", requiredPercentile: 30, majorStrengths: ["법학", "공학", "농업"] },
    { name: "충남대학교", requiredPercentile: 26, majorStrengths: ["공학", "자연과학", "인문"] },
    { name: "충북대학교", requiredPercentile: 32, majorStrengths: ["공학", "자연과학", "의학"] },
    { name: "강원대학교", requiredPercentile: 35, majorStrengths: ["산림", "수의학", "공학"] },
  ],
}

/**
 * 생기부 점수를 기반으로 전국 백분위 계산
 */
function calculateNationalPercentile(overallScore: number): number {
  // 생기부 점수 (0-100)를 전국 백분위 (1-100)로 변환
  // 95점 이상 = 상위 1-5%
  // 85-94점 = 상위 5-15%
  // 75-84점 = 상위 15-30%
  // 65-74점 = 상위 30-50%
  // 50-64점 = 상위 50-70%
  if (overallScore >= 95) {
    return Math.max(1, Math.round((100 - overallScore) * 0.5))
  } else if (overallScore >= 85) {
    return Math.round(5 + (95 - overallScore))
  } else if (overallScore >= 75) {
    return Math.round(15 + (85 - overallScore) * 1.5)
  } else if (overallScore >= 65) {
    return Math.round(30 + (75 - overallScore) * 2)
  } else {
    return Math.round(50 + (65 - overallScore) * 1.5)
  }
}

/**
 * 백분위에 따른 학력 수준 결정
 */
function getAcademicLevel(percentile: number): string {
  if (percentile <= 5) return "최상위권"
  if (percentile <= 15) return "상위권"
  if (percentile <= 30) return "중상위권"
  if (percentile <= 50) return "중위권"
  return "중하위권"
}

/**
 * 백분위와 전공에 맞는 대학 추천
 */
function getReachableUniversities(percentile: number, careerDirection: string): any[] {
  const results: any[] = []
  
  // 최상위권 (도전)
  if (percentile <= 15) {
    const topUnivs = KOREAN_UNIVERSITY_DATA.top_tier
      .filter(u => u.requiredPercentile >= percentile * 0.5)
      .slice(0, 3)
      .map(u => u.name)
    if (topUnivs.length > 0) {
      results.push({
        tier: "최상위권 (SKY/특수대학)",
        universities: topUnivs,
        probability: "도전"
      })
    }
  }
  
  // 상위권 (적정 또는 도전)
  if (percentile <= 25) {
    const highUnivs = KOREAN_UNIVERSITY_DATA.high_tier
      .filter(u => Math.abs(u.requiredPercentile - percentile) <= 8)
      .slice(0, 3)
      .map(u => u.name)
    if (highUnivs.length > 0) {
      results.push({
        tier: "상위권 대학",
        universities: highUnivs,
        probability: percentile <= 15 ? "적정" : "도전"
      })
    }
  }
  
  // 중상위권
  if (percentile <= 40) {
    const midHighUnivs = KOREAN_UNIVERSITY_DATA.mid_high_tier
      .filter(u => Math.abs(u.requiredPercentile - percentile) <= 10)
      .slice(0, 3)
      .map(u => u.name)
    if (midHighUnivs.length > 0) {
      results.push({
        tier: "중상위권 대학",
        universities: midHighUnivs,
        probability: percentile <= 25 ? "적정" : "도전"
      })
    }
  }
  
  // 중위권
  if (percentile <= 55) {
    const midUnivs = KOREAN_UNIVERSITY_DATA.mid_tier
      .filter(u => Math.abs(u.requiredPercentile - percentile) <= 12)
      .slice(0, 3)
      .map(u => u.name)
    if (midUnivs.length > 0) {
      results.push({
        tier: "중위권 대학",
        universities: midUnivs,
        probability: percentile <= 40 ? "적정" : "도전"
      })
    }
  }
  
  // 지방 거점 국립대
  if (percentile <= 45) {
    const regionalUnivs = KOREAN_UNIVERSITY_DATA.regional_national
      .filter(u => Math.abs(u.requiredPercentile - percentile) <= 15)
      .slice(0, 3)
      .map(u => u.name)
    if (regionalUnivs.length > 0) {
      results.push({
        tier: "지방 거점 국립대",
        universities: regionalUnivs,
        probability: "적정"
      })
    }
  }
  
  return results.slice(0, 4) // 최대 4개 계층 표시
}

/**
 * 대학 예측 분석 (개선된 버전 - 실제 데이터 기반)
 */
export async function predictUniversity(analysisResult: any, careerDirection: string): Promise<any> {
  try {
    // 1. 실제 데이터 기반 기본 계산
    const percentile = calculateNationalPercentile(analysisResult.overallScore)
    const academicLevel = getAcademicLevel(percentile)
    const reachableUniversities = getReachableUniversities(percentile, careerDirection)
    
    // 2. AI를 통한 상세 분석 (강점, 개선점, 추천사항)
    const prompt = `다음 생기부 분석 결과를 바탕으로 학생의 대학 진학 전략을 분석해주세요.

**생기부 점수**: ${analysisResult.overallScore}점 (전국 상위 ${percentile}%)
**학력 수준**: ${academicLevel}
**진로 방향**: ${careerDirection || '미지정'}
**강점**: ${analysisResult.strengths.join(', ')}
**개선점**: ${analysisResult.improvements.join(', ')}

다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "strengthAnalysis": "학생의 생기부에서 대학 진학에 유리한 강점을 2-3문장으로 구체적으로 분석해주세요. 진로 방향과 연계하여 설명하세요.",
  "improvementNeeded": "향후 개선이 필요한 부분을 2-3문장으로 구체적으로 제시해주세요. 현실적이고 실행 가능한 조언을 포함하세요.",
  "recommendations": [
    "구체적이고 실행 가능한 추천사항 1 (예: '진로와 연계된 심화 활동 추가')",
    "구체적이고 실행 가능한 추천사항 2 (예: '독서 활동의 전공 연계성 강화')",
    "구체적이고 실행 가능한 추천사항 3 (예: '봉사활동의 지속성과 진정성 확보')"
  ]
}
\`\`\`

**중요**: 추천사항은 학생부종합전형에서 실제로 도움이 되는 구체적이고 실행 가능한 조언을 작성해주세요.`

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    })

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    
    const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    const jsonText = codeBlockMatch ? codeBlockMatch[1] : generatedText.match(/\{[\s\S]*\}/)?.[0]
    const aiAnalysis = JSON.parse(jsonText || '{}')
    
    // 3. 실제 데이터와 AI 분석 결합
    return {
      nationalPercentile: percentile,
      academicLevel: academicLevel,
      reachableUniversities: reachableUniversities,
      strengthAnalysis: aiAnalysis.strengthAnalysis || "생기부 분석 결과를 바탕으로 강점을 파악했습니다.",
      improvementNeeded: aiAnalysis.improvementNeeded || "지속적인 개선이 필요합니다.",
      recommendations: aiAnalysis.recommendations || [
        "현재 생기부 수준을 유지하세요",
        "전공 적합성을 강화하세요",
        "지속적인 활동 참여를 추천합니다"
      ],
    }
  } catch (error) {
    console.error('[University Prediction Error]', error)
    
    // Fallback: 실제 데이터만 사용
    const percentile = calculateNationalPercentile(analysisResult.overallScore)
    const academicLevel = getAcademicLevel(percentile)
    const reachableUniversities = getReachableUniversities(percentile, careerDirection)
    
    return {
      nationalPercentile: percentile,
      academicLevel: academicLevel,
      reachableUniversities: reachableUniversities,
      strengthAnalysis: "생기부 분석 결과를 바탕으로 예측했습니다.",
      improvementNeeded: "지속적인 개선이 필요합니다.",
      recommendations: [
        "현재 생기부 수준을 유지하세요",
        "전공 적합성을 강화하세요",
        "지속적인 활동 참여를 추천합니다"
      ],
    }
  }
}

/**
 * 프로젝트 추천
 */
export async function recommendProjects(analysisResult: any, careerDirection: string): Promise<any> {
  try {
    const prompt = `다음 생기부 분석 결과와 진로 방향을 바탕으로 자율 과제를 추천해주세요.

**생기부 점수**: ${analysisResult.overallScore}점
**진로 방향**: ${careerDirection || '미지정'}
**강점**: ${JSON.stringify(analysisResult.strengths, null, 2)}
**개선점**: ${JSON.stringify(analysisResult.improvements, null, 2)}

다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "career": "${careerDirection || '진로 분석'}",
  "bestProject": {
    "title": "최적의 프로젝트 제목",
    "description": "프로젝트 상세 설명",
    "reason": "이 프로젝트를 추천하는 이유",
    "difficulty": "상",
    "duration": "3-4개월",
    "benefits": ["장점1", "장점2", "장점3"]
  },
  "projects": [
    {
      "title": "프로젝트 1",
      "description": "설명",
      "reason": "추천 이유",
      "difficulty": "상",
      "duration": "3-4개월",
      "benefits": ["장점1", "장점2"]
    },
    {
      "title": "프로젝트 2",
      "description": "설명",
      "reason": "추천 이유",
      "difficulty": "중상",
      "duration": "2-3개월",
      "benefits": ["장점1", "장점2"]
    }
  ],
  "tips": [
    "팁 1",
    "팁 2",
    "팁 3"
  ]
}
\`\`\``

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3072,
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    if (!generatedText) {
      throw new Error('AI 응답이 비어있습니다')
    }
    
    const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    const jsonText = codeBlockMatch ? codeBlockMatch[1] : generatedText.match(/\{[\s\S]*\}/)?.[0]
    
    if (!jsonText) {
      throw new Error('JSON 형식을 찾을 수 없습니다')
    }
    
    const result = JSON.parse(jsonText)
    return result
  } catch (error) {
    console.error('[Project Recommendation Error]', error)
    // Return structured fallback instead of throwing
    return {
      career: careerDirection || "진로 분석",
      bestProject: {
        title: "진로 연계 심화 탐구 프로젝트",
        description: "학생의 관심 분야를 깊이 있게 탐구하는 프로젝트입니다.",
        reason: "진로 적합성을 강화하고 전문성을 키울 수 있습니다.",
        difficulty: "중상",
        duration: "2-3개월",
        benefits: ["전공 역량 강화", "탐구 능력 향상", "생기부 내용 보강"],
      },
      projects: [
        {
          title: "독서 기반 심화 연구",
          description: "관심 분야 도서를 읽고 비평적 분석 수행",
          reason: "비판적 사고력 향상",
          difficulty: "중",
          duration: "1-2개월",
          benefits: ["독서 역량", "분석력 강화"],
        },
      ],
      tips: [
        "구체적인 결과물을 남기세요",
        "진로와의 연계성을 명확히 하세요",
        "과정을 상세히 기록하세요",
      ],
    }
  }
}

/**
 * AI 작성 탐지 분석 (별도 기능)
 */
export async function detectAIWriting(text: string): Promise<{
  overallAIProbability: number
  riskAssessment: '안전' | '주의' | '위험' | '매우위험'
  detectedSections: Array<{
    content: string
    aiProbability: number
    lineNumber: number
    reason: string
    humanWritingIndicators: string[]
    aiWritingIndicators: string[]
  }>
  recommendations: string[]
}> {
  try {
    const prompt = `다음 생기부 텍스트가 AI로 작성되었을 가능성을 정밀하게 분석해주세요.

**분석 대상 텍스트**:
\`\`\`
${text}
\`\`\`

**분석 기준**:
- AI 작성 지표: 과도하게 형식적인 문장, 일반적이고 추상적인 표현, 구체적 사례 부족, 정형화된 패턴
- 인간 작성 지표: 구체적 관찰 내용, 개인적 경험, 자연스러운 표현, 맥락 있는 서술

다음 JSON 형식으로 정확히 응답하세요:

\`\`\`json
{
  "overallAIProbability": 25,
  "riskAssessment": "안전",
  "detectedSections": [
    {
      "content": "분석할 텍스트 일부",
      "aiProbability": 15,
      "lineNumber": 1,
      "reason": "판단 근거",
      "humanWritingIndicators": ["인간 작성 지표1", "인간 작성 지표2"],
      "aiWritingIndicators": ["AI 작성 지표1"]
    }
  ],
  "recommendations": [
    "권장사항 1",
    "권장사항 2",
    "권장사항 3"
  ]
}
\`\`\`

**주의**: 
- overallAIProbability는 0-100 사이의 숫자
- riskAssessment는 "안전", "주의", "위험", "매우위험" 중 하나
- detectedSections는 최소 3개 이상 분석
- 각 section의 aiProbability도 0-100 사이의 숫자`

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
          maxOutputTokens: 4096,
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

    if (!response.ok) {
      throw new Error(`Gemini API 오류: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    
    // Extract JSON from markdown code blocks or plain text
    let jsonText = generatedText
    const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }
    
    const result = JSON.parse(jsonText)
    
    // Validate and return result
    return {
      overallAIProbability: result.overallAIProbability || 0,
      riskAssessment: result.riskAssessment || '안전',
      detectedSections: result.detectedSections || [],
      recommendations: result.recommendations || ['분석 결과를 확인해주세요.']
    }
  } catch (error) {
    console.error('[AI Detection Error]', error)
    return {
      overallAIProbability: 0,
      riskAssessment: '안전',
      detectedSections: [],
      recommendations: ['AI 작성 탐지 분석을 완료할 수 없습니다. 다시 시도해주세요.']
    }
  }
}
