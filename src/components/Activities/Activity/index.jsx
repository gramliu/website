import React from "react"
import { LinkIcon } from "../../../icons/link"
import * as styles from "./Activity.module.scss"

export const Activity = ({ activity }) => {
  const { altTitle, title, url, role, roleAlt, dates, description } = activity

  return (
    <div className={`${styles.container} activity-container`}>
      <div className={styles.title}>
        {url ? (
          <a
            href={url}
            target="_blank"
            className={`${styles.title} ${styles.titleLink}`}
          >
            {altTitle || title}
            <LinkIcon />
          </a>
        ) : (
          <div className={styles.title}>{altTitle || title}</div>
        )}
      </div>
      <div className={styles.role}>{role}</div>
      {
        roleAlt == null ? null : <div className={styles.roleAlt}>{roleAlt}</div>
      }
      
      <div className={styles.dates}>{dates}</div>
      <div className={styles.description}>
        <ul className={styles.descriptionList}>
          {description.map((item, index) => (
            <li key={index} className={styles.descriptionItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
