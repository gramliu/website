import React from "react"
import * as styles from "./index.module.scss"

const About = () => {
  return (
    <>
      <div className={styles.container} id="about">
        <div className={styles.header}>About Me</div>
        <div className={styles.content}>
          Hi! I'm Gram and I build things, from web apps to full stack to IoT.
          I'm a rising junior at{" "}
          <a
            href="https://www.cmu.edu/"
            target="_blank"
            rel="noreferrer"
            className="hoverLink"
          >
            Carnegie Mellon University
          </a>{" "}
          pursuing a major in Electrical and Computer Engineering. I am a big{" "}
          fan of technology and how it changes the way we think about and{" "}
          address problems from education to health care, consistently pushing{" "}
          the boundaries of what we think is possible.
          <br />
          <br />
          Outside of tech, I also really enjoy cooking! I try to do the food
          justice by honing the art of food photography over on{" "}
          <a
            href="https://www.instagram.com/gram_eats/"
            target="_blank"
            rel="noreferrer"
            className="hoverLink"
          >
            Instagram.
          </a>
        </div>
      </div>
    </>
  )
}

export default About
