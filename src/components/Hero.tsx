import { motion } from "framer-motion";
import Image from "next/image";
import ProfilePhoto from "../../public/images/profilePhoto.jpg";
import social from "../config/social";
import World from "./world";
import clsx from "clsx";

function HeroContent() {
  return (
    <div className="flex items-center md:flex-row flex-col">
      <div className="rounded-full border-highlight border-[5px] p-2 overflow-hidden">
        <Image
          src={ProfilePhoto}
          alt="Picture of me"
          className="h-[20vh] w-auto rounded-full"
          height={512}
          width={512}
          placeholder="blur"
          priority
        />
      </div>
      <div className="mt-4 md:mt-0 ml-0 md:ml-20 text-4xl">
        <span className="font-mono text-2xl">Hi! 👋</span>
        <br />
        <br />
        I&apos;m{" "}
        <span className="font-bold font-mono text-highlight whitespace-nowrap">
          Gram Liu.
        </span>
        <br />
        <span className="text-base">Developer. Engineer. Tech Enthusiast.</span>
      </div>
    </div>
  );
}

function SocialIcons() {
  return (
    <div className="flex items-center justify-evenly w-full md:w-10/12 mt-10 mx-auto gap-10">
      {social.map(({ image, url }) => (
        <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
          <div className="mt-5 border-2 rounded-full p-4 flex items-center justify-center transition hover:bg-bgcolor-highlight">
            {image}
          </div>
        </a>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <>
      <div
        className={clsx(
          "items-center justify-center h-auto",
          "xl:flex xl:justify-center xl:items-center",
        )}
        id="home"
      >
        <div className="flex flex-col xl:w-1/2 mb-[5%] h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "spring",
              duration: 0.5,
              stiffness: 150,
              damping: 50,
            }}
          >
            <HeroContent />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 20,
              duration: 1,
              delay: 0.7,
            }}
          >
            <SocialIcons />
          </motion.div>
        </div>
        <div className="mt-[10%] xl:w-1/2 h-screen" id="world">
          <World size={0.8} />
        </div>
      </div>
    </>
  );
}
