"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const capabilities = [
  {
    number: "01",
    title: "Designledelse",
    description: "Det store bildet. Ned til pikselen.",
    tags: ["Strategi", "Team", "System"],
  },
  {
    number: "02",
    title: "Produktstrategi",
    description: "Gjør det komplekse forståelig.",
    tags: ["Research", "Roadmap", "Prioritering"],
  },
  {
    number: "03",
    title: "UX-design",
    description: "Grensesnitt folk faktisk vil bruke.",
    tags: ["Interaksjon", "Testing", "Prototyping"],
  },
];

export default function Work() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{ backgroundColor: "var(--color-bg-warm)" }}
      className="py-[80px] sm:py-[120px] lg:py-[160px] px-6 sm:px-10 lg:px-16"
      id="work"
    >
      <div className="max-w-[1100px] mx-auto">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 sm:mb-20">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-muted text-[10px] tracking-[0.22em] uppercase mb-4"
            >
              Fagområder
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-editorial text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] tracking-[-0.025em] max-w-[480px]"
            >
              Der jeg gjør størst forskjell.
            </motion.h2>
          </div>

          <motion.a
            href="mailto:hello@waso.no"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.4 }}
            className="btn-pill btn-pill-dark self-start sm:self-auto"
          >
            Start et prosjekt
          </motion.a>
        </div>

        {/* Capabilities list */}
        <div className="border-waso border-t">
          {capabilities.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.3 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="border-waso group flex flex-col sm:flex-row sm:items-center justify-between py-7 sm:py-8 border-b cursor-default"
            >
              <div className="flex items-baseline gap-5 sm:gap-8">
                <span className="text-light text-[10px] tracking-[0.1em] font-mono w-6 flex-shrink-0">
                  {item.number}
                </span>
                <div>
                  <h3 className="font-editorial text-[clamp(1.6rem,3vw,2.4rem)] tracking-[-0.02em] leading-none group-hover:translate-x-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                    {item.title}
                  </h3>
                  <p className="text-muted text-sm mt-1.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 sm:mt-0 ml-11 sm:ml-0 flex-wrap">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-waso text-muted text-[10px] tracking-[0.08em] py-1 px-3 rounded-full border group-hover:border-black/20 transition-colors duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Currently */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
        >
          <span className="text-muted text-xs tracking-wide">Jobber hos</span>
          <div className="flex items-center gap-3">
            <a
              href="https://increo.no"
              target="_blank"
              rel="noopener noreferrer"
              className="font-editorial text-lg hover:opacity-50 transition-opacity"
            >
              Increo
            </a>
            <span className="text-light">×</span>
            <a
              href="https://99x.no"
              target="_blank"
              rel="noopener noreferrer"
              className="font-editorial text-lg hover:opacity-50 transition-opacity"
            >
              99x
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
