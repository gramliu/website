import React from "react"
import { makeStyles, useTheme } from "@material-ui/core"
import { social } from "../../config"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    height: "100vh",
  },
  dialog: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "5%",
  },
  dialogContent: {
    display: "flex",
    alignItems: "center",
  },
  portrait: {
    height: "20vh",
    borderRadius: "50%",
    border: `solid ${theme.palette.textColor} 2px`,
  },
  dialogText: {
    marginLeft: "5rem",
    fontSize: "2rem",
    color: theme.palette.textColor,
    fontFamily: "'Argentum Sans', sans-serif",
  },
  introLabel: {
    fontFamily: "'Roboto Mono', monospace",
    color: theme.palette.highlight,
    fontSize: "1.5rem",
  },
  nameLabel: {
    fontWeight: "bold",
    color: theme.palette.textAlt,
  },
  subLabel: {
    fontSize: "1rem",
  },
  socialButtons: {
    marginTop: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "80%",
    margin: "0 auto",
  },
  socialImage: {
    margin: "10px 0 10px 0",
    border: `solid ${theme.palette.textColor} 2px`,
    borderRadius: "50%",
    padding: "1rem",
    transition: "border 0.25s, transform 0.25s, background 0.25s",
    "& svg": {
      width: "35px",
      height: "35px",
      transition: "fill 0.25s, transform 0.25s",
      fill: theme.palette.textColor,
    },
    "&:hover": {
      transform: "scale(1.1)",
      border: `solid ${theme.palette.textColor} 2px`,
      background: theme.palette.textColor,
    },
    "&:hover svg": {
      fill: theme.palette.highlightDarker,
    },
  },
}))

const Home = () => {
  const theme = useTheme()
  const classes = useStyles(theme)
  return (
    <>
      <div className={classes.container}>
        <div className={classes.dialog}>
          <div className={classes.dialogContent}>
            <div>
              <img
                src={"/images/profilePhoto.jpg"}
                alt="Picture of me"
                className={classes.portrait}
              />
            </div>
            <div className={classes.dialogText}>
              <span className={classes.introLabel}>Hi! 👋</span>
              <br />
              <br />
              I'm <span className={classes.nameLabel}>Gram Liu.</span>
              <br />
              <span className={classes.subLabel}>
                Developer. Engineer. Tech Enthusiast.
              </span>
            </div>
          </div>
          <div className={classes.socialButtons}>
            {social.map(({ image, url }) => (
              <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
                <div className={classes.socialImage}>{image}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
