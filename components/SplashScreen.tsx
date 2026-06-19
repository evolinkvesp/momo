"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OrbitalLoader } from "@/components/ui/OrbitalLoader";

export function SplashScreen({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-black overflow-hidden flex items-center justify-center"
        >
          {/* Custom Orbital Loader */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <OrbitalLoader className="w-24 h-24 text-ember" />
            <h1 className="text-white font-black tracking-widest text-xl">MOMO</h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
