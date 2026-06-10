"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function SplashScreen({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0d0d0d]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative w-48 h-48"
          >
            {/* Glow effect behind GIF */}
            <div className="absolute inset-0 bg-ember/20 blur-3xl rounded-full" />
            
            <Image
              src="/splash.gif"
              alt="Momo Loading"
              fill
              className="object-contain relative z-10"
              priority
              unoptimized // Essential for GIFs to animate immediately
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
