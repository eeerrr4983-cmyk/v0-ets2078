"use client"

import { useEffect, useRef, useState } from "react"

interface UseIntersectionObserverOptions {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}) {
  const { threshold = 0, root = null, rootMargin = "0px", freezeOnceVisible = false } = options

  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const elementRef = useRef<Element | null>(null)
  const frozen = useRef(false)

  useEffect(() => {
    const node = elementRef.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen.current || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry)

      if (entry.isIntersecting && freezeOnceVisible) {
        frozen.current = true
      }
    }, observerParams)

    observer.observe(node)

    return () => observer.disconnect()
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return { ref: elementRef, entry, isIntersecting: entry?.isIntersecting ?? false }
}
