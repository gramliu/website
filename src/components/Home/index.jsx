import React from "react";
import { social } from "../../config";
import * as styles from "./index.module.scss";

const Home = () => {
  return (
    <>
      <div className={styles.container} id="home">
        <div className={styles.dialog}>
          <div className={styles.dialogContent}>
            <div>
              <img
                src={"/images/profilePhoto.jpg"}
                alt="Picture of me"
                className={styles.portrait}
              />
            </div>
            <div className={styles.dialogText}>
              <span className={styles.introLabel}>Hi! 👋</span>
              <br />
              <br />
              I'm <span className={styles.nameLabel}>Gram Liu.</span>
              <br />
              <span className={styles.subLabel}>
                Developer. Engineer. Tech Enthusiast.
              </span>
            </div>
          </div>
          <div className={styles.socialButtons}>
            {social.map(({ image, url }) => (
              <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
                <div className={styles.socialImage}>{image}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
