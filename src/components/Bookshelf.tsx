import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Book } from "../server/getBooks";

const animationStyle = "transition-all duration-500 ease will-change-auto";

// For md and up
function InteractiveBookshelf({ books }: { books: Book[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  return (
    <div
      role="list"
      className="md:flex flex-row flex-start gap-4 lg:w-8/12 mx-auto hidden pb-4 overflow-x-auto"
    >
      {books.map((book, index) => (
        <button
          role="listitem"
          key={book.title}
          onClick={() => {
            if (index === focusedIndex) {
              setFocusedIndex(-1);
            } else {
              setFocusedIndex(index);
            }
          }}
          className={clsx(
            "flex shrink-0 flex-row items-center outline-none",
            focusedIndex !== index &&
              "hover:-translate-y-4 focus-visible:-translate-y-4",
            focusedIndex === index ? "basis-72" : "basis-12",
            animationStyle
          )}
          style={{ perspective: "1000px", WebkitPerspective: "1000px" }}
        >
          <div
            className={clsx(
              "z-50 h-72 w-[50px] shrink-0 origin-right py-4 brightness-[0.80] contrast-[2.00] drop-shadow-2xl",
              animationStyle
            )}
            style={{
              backgroundColor: book.bgColor,
              color: book.fgColor,
              transformStyle: "preserve-3d",
              transform: `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(${
                focusedIndex === index ? "-60deg" : "0deg"
              }) rotateZ(0deg) skew(0deg, 0deg)`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none fixed top-0 left-0 z-50 h-full w-full opacity-40 [filter:url(#paper)]"
            />
            <h2
              className="text-base m-auto text-ellipsis h-64 w-[44px] font-serif line-clamp-2 align-middle leading-tight text-start"
              style={{ writingMode: "vertical-rl" }}
            >
              {book.title}
            </h2>
          </div>
          <div
            className={clsx(
              "relative z-10 h-72 shrink-0 origin-left overflow-hidden border-gray-900 brightness-[0.80] contrast-[2.00]",
              animationStyle
            )}
            style={{
              transformStyle: "preserve-3d",
              transform: `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(${
                focusedIndex === index ? "30deg" : "90deg"
              }) rotateZ(0deg) skew(0deg, 0deg)`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none fixed top-0 right-0 z-50 h-full w-full opacity-40 [filter:url(#paper)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 z-50 h-full w-full"
              style={{
                background: `linear-gradient(to right, rgba(255, 255, 255, 0) 2px, rgba(255, 255, 255, 0.5) 3px, rgba(255, 255, 255, 0.25) 4px, rgba(255, 255, 255, 0.25) 6px, transparent 7px, transparent 9px, rgba(255, 255, 255, 0.25) 9px, transparent 12px)`,
              }}
            />
            {book.hasValidImage ? (
              <Image
                src={book.imageUrl}
                alt={book.title}
                width={128}
                height={128}
                className={clsx("h-full w-48 bg-cover", animationStyle)}
              />
            ) : (
              <div className="h-full w-48 bg-cover" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// For sm and down
function StaticBookshelf({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 mx-auto justify-center items-center md:hidden">
      {books.map((book) => (
        <div
          key={book.title}
          className="flex flex-col items-center justify-center gap-2 full h-72"
        >
          {book.hasValidImage ? (
            <Image
              src={book.imageUrl}
              alt={book.title}
              width={128}
              height={128}
              className="h-full w-auto bg-cover"
            />
          ) : (
            <div className="h-full w-auto bg-cover" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Bookshelf({
  className,
  books,
}: {
  className?: string;
  books: Book[];
}): JSX.Element {
  return (
    <div className={className}>
      <div
        id="bookshelf"
        className="flex items-center justify-center text-center w-full font-bold text-3xl mb-8 mx-auto"
      >
        <a
          href="#bookshelf"
          className="hover:underline cursor-pointer"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Bookshelf
        </a>
      </div>
      <svg className="invisible absolute inset-0">
        <defs>
          <filter id="paper" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="8"
              result="noise"
            />
            <feDiffuseLighting
              in="noise"
              lightingColor="white"
              surfaceScale="1"
              result="diffLight"
            >
              <feDistantLight azimuth="45" elevation="35" />
            </feDiffuseLighting>
          </filter>
        </defs>
      </svg>
      {books.length > 0 && (
        <motion.div
          initial={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 20,
            duration: 1,
          }}
        >
          <InteractiveBookshelf books={books} />
          <StaticBookshelf books={books} />
        </motion.div>
      )}
    </div>
  );
}
