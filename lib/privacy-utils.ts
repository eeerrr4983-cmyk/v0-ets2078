// Utility functions for masking sensitive information

export function maskSensitiveInfo(text: string): string {
  // Mask names (keep first character, replace rest with *)
  const namePattern = /([가-힣]{2,4})/g
  let masked = text.replace(namePattern, (match) => {
    return match[0] + "*".repeat(match.length - 1)
  })

  // Mask student IDs (format: YYYYNNNNN)
  const studentIdPattern = /\d{9}/g
  masked = masked.replace(studentIdPattern, (match) => {
    return match.substring(0, 4) + "*****"
  })

  // Mask phone numbers
  const phonePattern = /\d{3}-\d{4}-\d{4}/g
  masked = masked.replace(phonePattern, (match) => {
    const parts = match.split("-")
    return `${parts[0]}-****-${parts[2]}`
  })

  // Mask email addresses
  const emailPattern = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g
  masked = masked.replace(emailPattern, (match, username, domain) => {
    const maskedUsername = username[0] + "*".repeat(Math.max(username.length - 1, 3))
    return `${maskedUsername}@${domain}`
  })

  return masked
}

export function detectSensitiveInfo(text: string): string[] {
  const sensitive: string[] = []

  // Detect names
  const namePattern = /[가-힣]{2,4}/g
  const names = text.match(namePattern)
  if (names) sensitive.push(...names.map((n) => `이름: ${n}`))

  // Detect student IDs
  const studentIdPattern = /\d{9}/g
  const ids = text.match(studentIdPattern)
  if (ids) sensitive.push(...ids.map((id) => `학번: ${id}`))

  // Detect phone numbers
  const phonePattern = /\d{3}-\d{4}-\d{4}/g
  const phones = text.match(phonePattern)
  if (phones) sensitive.push(...phones.map((p) => `전화번호: ${p}`))

  return sensitive
}
