import Image from "next/future/image";
import social from "../../config/social";
import styles from "./index.module.scss";

export default function Hero() {
  return (
    <>
      <div className={styles.container} id="home">
        <div className={styles.dialog}>
          <div className={styles.dialogContent}>
            <div>
              <Image
                src="/images/profilePhoto.jpg"
                alt="Picture of me"
                className={styles.portrait}
                height={512}
                width={512}
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
          <div className={styles.socialIconsContainer}>
            {social.map(({ image, url }) => (
              <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
                <div className={styles.socialIcon}>{image}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
