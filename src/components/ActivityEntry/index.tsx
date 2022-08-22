import clsx from "clsx";
import { Activity } from "../../config/activities";
import LinkIcon from "../../icons/link";
import styles from "./index.module.scss";

export default function ActivityEntry({
  altTitle,
  title,
  url,
  role,
  roleAlt,
  dates,
  description,
}: Activity) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={clsx(styles.title, styles.titleLink)}
          >
            {altTitle || title}
            <LinkIcon />
          </a>
        ) : (
          <div className={styles.title}>{altTitle || title}</div>
        )}
      </div>
      <div className={styles.role}>{role}</div>
      {roleAlt == null ? null : <div className={styles.roleAlt}>{roleAlt}</div>}

      <div className={styles.dates}>{dates}</div>
      <div className={styles.description}>
        <ul>
          {description.map((item, index) => (
            <li key={index} className={styles.descriptionItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
