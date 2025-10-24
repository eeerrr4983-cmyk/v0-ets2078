"use client"

import { useState, useCallback } from "react"

export function useOptimisticUpdate<T>(initialValue: T, updateFn: (value: T) => Promise<T>) {
  const [value, setValue] = useState<T>(initialValue)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const update = useCallback(
    async (newValue: T) => {
      // Optimistically update UI
      const previousValue = value
      setValue(newValue)
      setIsUpdating(true)
      setError(null)

      try {
        // Perform actual update
        const result = await updateFn(newValue)
        setValue(result)
        return result
      } catch (err) {
        // Revert on error
        setValue(previousValue)
        setError(err as Error)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [value, updateFn],
  )

  return { value, update, isUpdating, error }
}
