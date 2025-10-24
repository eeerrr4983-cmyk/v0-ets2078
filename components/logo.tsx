"use client"

import { motion } from "framer-motion"
import { Flame } from "lucide-react"

export function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex items-center gap-3"
    >
      <div className="relative">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-10 h-10 rounded-2xl liquid-glass flex items-center justify-center"
        >
          <Flame className="w-5 h-5 text-black" />
        </motion.div>
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-black">Huntfire</h1>
        <p className="text-xs text-gray-500">AI Agent Platform</p>
      </div>
    </motion.div>
  )
}
