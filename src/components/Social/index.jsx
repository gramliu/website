import { makeStyles, useTheme } from "@material-ui/core"
import React from "react"
import { social } from "../../config"

const useStyles = makeStyles((theme) => ({
  socialContainer: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    bottom: 0,
    right: "30px",
    "&::after": {
      content: "''",
      display: "block",
      width: "1px",
      height: "100px",
      margin: "0 auto",
      backgroundColor: theme.palette.textColor,
    },
    zIndex: 100,
  },
  socialImage: {
    margin: "10px 0 10px 0",
    "& svg": {
      width: "30px",
      height: "30px",
      transition: "fill 0.25s, scale 0.25s",
      fill: theme.palette.textColor,
    },
    "& svg:hover": {
      fill: theme.palette.highlight,
      transform: "scale(1.1)",
    },
  },
}))

const Social = () => {
  const theme = useTheme()
  const classes = useStyles(theme)

  return (
    <div className={classes.socialContainer}>
      {social.map((entry) => {
        const { name, image, url } = entry
        return (
          <a
            href={url}
            key={name}
            className={classes.socialLink}
            target="_blank"
            rel="noreferrer"
          >
            <div className={classes.socialImage}>{image}</div>
          </a>
        )
      })}
    </div>
  )
}

export default Social
