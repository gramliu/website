import styles from "./index.module.scss";

export default function Footer() {
  return (
    <>
      <div className={styles.container} id="footer">
        <span className={styles.footerText}>&copy; Gram Liu 2022</span>
      </div>
    </>
  );
}
