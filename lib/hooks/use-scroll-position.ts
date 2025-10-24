"use client"

import { useState, useEffect } from "react"

export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down")

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateScrollPosition = () => {
      const scrollY = window.scrollY

      setScrollDirection(scrollY > lastScrollY ? "down" : "up")
      setScrollPosition(scrollY)
      lastScrollY = scrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollPosition)
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return { scrollPosition, scrollDirection }
}
