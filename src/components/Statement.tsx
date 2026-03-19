"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const statementText =
  "Jeg hjelper selskaper med å forme bedre produkter, fra strategi til design og teknologi. Broen mellom det virksomheten trenger og det folk vil ha.";

const words = statementText.split(" ");

function Word({
  word,
  index,
  totalWords,
  scrollYProgress,
}: {
  word: string;
  index: number;
  totalWords: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / totalWords;
  const end = start + 1 / totalWords;

  const opacity = useTransform(scrollYProgress, [start, end], [0.12, 1]);
  const color = useTransform(
    scrollYProgress,
    [start, end],
    ["rgba(0,0,0,0.2)", "#000000"]
  );

  return (
    <motion.span
      style={{ opacity, color }}
      className="inline-block mr-[0.3em]"
    >
      {word}
    </motion.span>
  );
}

export default function Statement() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.65", "start 0.1"],
  });

  return (
    <section
      ref={containerRef}
      style={{ backgroundColor: "var(--color-bg)" }}
      className="py-[100px] sm:py-[140px] lg:py-[180px] px-6 sm:px-10 lg:px-16"
      id="about"
    >
      <div className="max-w-[1100px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted text-[10px] tracking-[0.22em] uppercase mb-10"
        >
          Om meg
        </motion.p>

        <h2 className="font-editorial text-[clamp(2.4rem,6.5vw,4.8rem)] leading-[1.1] tracking-[-0.025em]">
          {words.map((word, i) => (
            <Word
              key={`${word}-${i}`}
              word={word}
              index={i}
              totalWords={words.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted mt-14 flex flex-wrap gap-5 text-xs tracking-wide"
        >
          <span>Magnus Walberg Solbakken</span>
          <span className="text-light">·</span>
          <span>Oslo, Norge</span>
          <span className="text-light">·</span>
          <span>15+ år med design</span>
        </motion.div>
      </div>
    </section>
  );
}
