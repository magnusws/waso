"use client";

import { motion } from "framer-motion";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Logo from "./Logo";

// Dynamic import for the 3D scene to avoid SSR issues
const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0" />
  ),
});

export default function Hero() {
  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
      id="hero"
    >
      {/* 3D canvas — full background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="absolute inset-0" />}>
          <Scene3D />
        </Suspense>
      </div>

      {/* Top bar: Logo + Kontakt meg */}
      <nav className="relative z-10 pointer-events-none flex items-center justify-between px-6 sm:px-10 lg:px-16 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-auto"
        >
          <Logo className="h-5 sm:h-6 w-auto" />
        </motion.div>

        <motion.a
          href="mailto:hello@waso.no"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="pointer-events-auto btn-pill btn-pill-dark"
        >
          Kontakt meg
        </motion.a>
      </nav>

      {/* Hero content — centered */}
      <div className="relative z-10 pointer-events-none flex-1 flex flex-col items-center justify-center px-6 sm:px-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-muted text-xs tracking-[0.18em] uppercase mb-6"
        >
          Magnus Walberg Solbakken
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="font-editorial text-[clamp(3.4rem,11.5vw,9rem)] leading-[0.9] tracking-[-0.03em] max-w-[900px]"
        >
          Bedre produkter,{" "}
          <em>gjort riktig.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-8 text-muted text-sm sm:text-base max-w-[440px] leading-relaxed pointer-events-auto"
        >
          Jeg skaper digitale opplevelser hos{" "}
          <a
            href="https://www.increo.no"
            target="_blank"
            rel="noopener noreferrer"
            className="company-link"
          >
            Increo
          </a>{" "}
          og{" "}
          <a
            href="https://www.99x.no"
            target="_blank"
            rel="noopener noreferrer"
            className="company-link"
          >
            99x
          </a>
          .
        </motion.p>
      </div>
    </section>
  );
}
