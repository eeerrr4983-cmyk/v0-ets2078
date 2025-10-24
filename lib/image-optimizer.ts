export class ImageOptimizer {
  static async compressImage(file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()

        img.onload = () => {
          const canvas = document.createElement("canvas")
          let { width, height } = img

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Failed to get canvas context"))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to compress image"))
              }
            },
            file.type,
            quality,
          )
        }

        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = e.target?.result as string
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  static async optimizeForUpload(file: File): Promise<File> {
    try {
      const compressed = await this.compressImage(file)
      return new File([compressed], file.name, { type: file.type })
    } catch (error) {
      console.error("[ImageOptimizer] Compression failed:", error)
      return file // Return original if compression fails
    }
  }
}
