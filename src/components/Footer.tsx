"use client";

import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{ backgroundColor: "var(--color-bg-dark)", color: "#fff3d3" }}
      className="rounded-t-[20px] sm:rounded-t-[28px] mx-3 sm:mx-6 lg:mx-10 overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        {/* Big serif links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-0 mb-20"
        >
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-editorial block text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.15] tracking-[-0.025em] opacity-35 hover:opacity-100 transition-opacity duration-300"
          >
            LinkedIn →
          </a>
          <a
            href="mailto:hello@waso.no"
            className="font-editorial block text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.15] tracking-[-0.025em] opacity-35 hover:opacity-100 transition-opacity duration-300"
          >
            E-post →
          </a>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6"
          style={{ borderTop: "1px solid var(--color-border-dark)" }}
        >
          <p className="opacity-30 text-[11px] tracking-wide">
            © {currentYear} WASO
          </p>
          <p className="opacity-30 text-[11px] tracking-wide">
            Magnus Walberg Solbakken · Oslo, Norge
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
