import { motion } from "framer-motion";
import Image from "next/image";
import ProfilePhoto from "../../../public/images/profilePhoto.jpg";
import social from "../../config/social";
import styles from "./index.module.scss";

function HeroContent() {
  return (
    <div className={styles.dialogContent}>
      <div className={styles.portraitContainer}>
        <Image
          src={ProfilePhoto}
          alt="Picture of me"
          className={styles.portrait}
          height={512}
          width={512}
          placeholder="blur"
          priority
        />
      </div>
      <div className={styles.dialogText}>
        <span className={styles.introLabel}>Hi! 👋</span>
        <br />
        <br />
        I&apos;m <span className={styles.nameLabel}>Gram Liu.</span>
        <br />
        <span className={styles.subLabel}>
          Developer. Engineer. Tech Enthusiast.
        </span>
      </div>
    </div>
  );
}

function SocialIcons() {
  return (
    <div className={styles.socialIconsContainer}>
      {social.map(({ image, url }) => (
        <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
          <div className={styles.socialIcon}>{image}</div>
        </a>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <>
      <div className={styles.container} id="home">
        <div className={styles.dialog}>
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
      </div>
    </>
  );
}
