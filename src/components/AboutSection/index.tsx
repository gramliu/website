import styles from "./index.module.scss";

export default function About() {
  return (
    <>
      <div className={styles.container} id="about">
        <div className={styles.header}>About Me</div>
        <div className={styles.content}>
          Hi! I&apos;m Gram and I build things, from web apps to full stack to
          IoT. I graduated from{" "}
          <a
            href="https://www.cmu.edu/"
            target="_blank"
            rel="noreferrer"
            className="hoverLink"
          >
            Carnegie Mellon University
          </a>{" "}
          with a major in Electrical and Computer Engineering and a minor in
          Computer Science. I&apos;m a big fan of technology and how it
          revolutionizes the way we tackle everything from payments to
          education, consistently pushing the boundaries of what we think is
          possible.
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
  );
}
