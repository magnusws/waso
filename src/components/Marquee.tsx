"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const items = [
  "Produktstrategi",
  "UX-design",
  "Systemtenkning",
  "Digitale produkter",
  "Menneskesentrert design",
  "Innovasjon",
  "Tjenestedesign",
  "Designledelse",
];

export default function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 1.5 }}
      className="relative py-10 sm:py-14 overflow-hidden border-y border-foreground/[0.04]"
    >
      <div className="animate-marquee flex whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="mx-6 sm:mx-10 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-muted/30 flex items-center gap-6 sm:gap-10"
          >
            {item}
            <span className="w-1 h-1 rounded-full bg-accent/20" />
          </span>
        ))}
      </div>
    </motion.div>
  );
}
