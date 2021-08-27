import * as React from "react"
import { Link } from "gatsby"
import { makeStyles, useTheme } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    height: "100vh",
    width: "100vw",
  },
  dialog: {
    background: theme.palette.backgroundLight,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
    padding: "2em",
    fontSize: "1.5em",
    color: theme.palette.textColor,
    gap: "0.5em",
    zIndex: 0,
    "& a": {
      margin: "0 0.3rem 0 0.3rem",
      textDecoration: "none",
      color: theme.palette.highlight,
      ...theme.hoverLink,
    },
  },
  errorTitle: {
    color: theme.palette.errorText,
    fontSize: "3em",
  },
  errorDescription: {
    marginBottom: "2em",
  }
}))

const NotFoundPage = () => {
  const theme = useTheme()
  const classes = useStyles(theme)
  console.log(theme.palette.error)

  return (
    <div className={classes.container}>
      <div className={classes.dialog}>
        <div className={classes.errorTitle}>Error 404</div>
        <div className={classes.errorDescription}>The page or resource you were looking for does not exist!</div>
        <a href="/" className="hoverLink">
          Return home
        </a>
      </div>
    </div>
  )
}

export default NotFoundPage
