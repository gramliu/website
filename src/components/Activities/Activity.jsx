import React from "react"
import { makeStyles, useTheme } from "@material-ui/core"
import { LinkIcon } from "../../icons/link"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "2rem",
  },
  titleLink: {
    color: theme.palette.textColor,
    textDecoration: "none",
    transition: "transform 0.25s",
    display: "inline-block",
    "& svg": {
      height: "0.6em",
      marginLeft: "0.3em",
      fill: theme.palette.textColor,
      opacity: 0.8,
    },
    "&:hover": {
      transform: "translate(0, -3px)",
    },
  },
  role: {
    marginTop: "0.5rem",
    textTransform: "uppercase",
    color: theme.palette.highlight,
    fontSize: "1rem",
    fontWeight: "bold",
  },
  dates: {
    fontSize: "0.8rem",
    marginTop: "0.5rem",
    opacity: 0.8,
  },
  description: {
    marginTop: "0.5rem",
    fontSize: "0.9rem",
  },
  descriptionItem: {
    width: "50%",
    [theme.breakpoints.down("md")]: {
      width: "80%",
    },
    marginBottom: "1rem",
  },
}))

export const Activity = ({ activity }) => {
  const { altTitle, title, url, role, dates, description } = activity
  const theme = useTheme()
  const classes = useStyles(theme)

  return (
    <div className={`${classes.container} activity-container`}>
      <div className={classes.title}>
        {url ? (
          <a
            href={url}
            target="_blank"
            className={`${classes.title} ${classes.titleLink}`}
          >
            {altTitle || title}
            <LinkIcon />
          </a>
        ) : (
          <div className={classes.title}>{altTitle || title}</div>
        )}
      </div>
      <div className={classes.role}>{role}</div>
      <div className={classes.dates}>{dates}</div>
      <div className={classes.description}>
        <ul className={classes.descriptionList}>
          {description.map((item, index) => (
            <li key={index} className={classes.descriptionItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
