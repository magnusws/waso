"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Currently() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-32 sm:py-44 px-6 sm:px-10 md:px-16 lg:px-24"
      id="currently"
    >
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-12 lg:gap-0">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:pr-16"
          >
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-cream/50 mb-6">
              Now
            </p>
            <p className="font-serif text-xl sm:text-2xl font-light leading-[1.4] text-cream/80">
              <a href="https://increo.no" target="_blank" rel="noopener noreferrer" className="text-cream hover:text-accent transition-colors duration-500">Increo</a>
              {" · "}
              <a href="https://99x.no" target="_blank" rel="noopener noreferrer" className="text-cream hover:text-accent transition-colors duration-500">99x</a>
            </p>
          </motion.div>

          {/* Divider */}
          <div className="hidden lg:block bg-cream/[0.08]" />

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:pl-16"
          >
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-cream/50 mb-6">
              Oslo, Norway
            </p>
            <p className="font-serif italic text-lg text-cream/60 leading-relaxed">
              Strategy, design, and technology —
              <br />
              where they meet people.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
