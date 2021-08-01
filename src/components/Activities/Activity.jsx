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
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  description: {
    marginTop: "0.5rem",
    fontSize: "0.9rem",
  },
}))

export const Activity = ({ title, url, role, description }) => {
  const theme = useTheme()
  const classes = useStyles(theme)
  return (
    <div className={classes.container}>
      <div className={classes.title}>
        {url ? (
          <a
            href={url}
            target="_blank"
            className={`${classes.title} ${classes.titleLink}`}
          >
            {title}
            <LinkIcon />
          </a>
        ) : (
          <div className={classes.title}>{title}</div>
        )}
      </div>
      <div className={classes.role}>{role}</div>
      <div className={classes.description}>{description}</div>
    </div>
  )
}
