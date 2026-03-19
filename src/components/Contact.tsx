"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{ backgroundColor: "var(--color-bg)" }}
      className="py-[100px] sm:py-[140px] lg:py-[200px] px-6 sm:px-10 lg:px-16"
      id="contact"
    >
      <div className="max-w-[1100px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted text-[10px] tracking-[0.22em] uppercase mb-8"
        >
          Kontakt
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-editorial text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.95] tracking-[-0.03em] mb-14"
        >
          Har du et prosjekt?
          <br />
          <em>La oss snakkes.</em>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap gap-3"
        >
          <a
            href="mailto:hello@waso.no"
            className="btn-pill btn-pill-dark"
            id="cta-email"
          >
            Send en e-post
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill btn-pill-outline"
            id="cta-linkedin"
          >
            LinkedIn
          </a>
        </motion.div>
      </div>
    </section>
  );
}
