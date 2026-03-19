export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="WASO"
    >
      <text
        x="0"
        y="19"
        fill="currentColor"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight="800"
        fontSize="21"
        letterSpacing="0.22em"
      >
        WASO
      </text>
    </svg>
  );
}
