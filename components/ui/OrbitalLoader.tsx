"use client"

import React from "react"
import { motion } from "framer-motion"

const PLACEMENT_CLASS: Record<string, string> = {
  bottom: "flex-col",
  top:    "flex-col-reverse",
  right:  "flex-row",
  left:   "flex-row-reverse",
}

export interface OrbitalLoaderProps {
  message?: string
  messagePlacement?: "top" | "bottom" | "left" | "right"
}

export function OrbitalLoader({
  className = "",
  message,
  messagePlacement = "bottom",
  ...props
}: React.ComponentProps<"div"> & OrbitalLoaderProps) {
  const dirClass = PLACEMENT_CLASS[messagePlacement] ?? "flex-col"

  return (
    <div className={`flex gap-2 items-center justify-center ${dirClass}`}>
      <div className={`relative w-16 h-16 ${className}`} {...props}>
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-current rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-transparent border-t-current rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 border-2 border-transparent border-t-current rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
      {message && <div>{message}</div>}
    </div>
  )
}
