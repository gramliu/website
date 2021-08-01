import React from "react"
import { makeStyles, useTheme } from "@material-ui/core"

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
    alignItems: "center",
    marginRight: "20%",
    marginBottom: "5%",
  },
  portrait: {
    height: "20vh",
    borderRadius: "50%",
    border: `solid ${theme.palette.textColor} 1px`,
  },
  dialogText: {
    marginLeft: "5rem",
    fontSize: "2rem",
    color: theme.palette.textColor,
    fontFamily: "'Argentum Sans', sans-serif"
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
  buttonContainer: {
    marginTop: "2rem",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonLink: {
    fontSize: "1.2rem",
    color: theme.palette.textColor,
    textDecoration: "none",
    "&:first-child": {
      marginRight: "1rem",
    },
    "&:last-child": {
      marginLeft: "1rem",
    },
  },
  button: {
    padding: "0.7rem 1rem 0.7rem 1rem",
    border: `solid ${theme.palette.textColor} 1px`,
    borderRadius: "2rem",
    transition: "border 0.25s, color 0.25s",
    "&:hover": {
      border: `solid ${theme.palette.highlight} 1px`,
      color: theme.palette.highlight,
    },
  },
}))

const Home = () => {
  const theme = useTheme()
  console.log(theme)
  const classes = useStyles(theme)
  return (
    <>
      <div className={classes.container}>
        <div className={classes.dialog}>
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
            <span className={classes.subLabel}>I build things.</span>
            <div className={classes.buttonContainer}>
              <a
                href="resume.pdf"
                target="_blank"
                className={classes.buttonLink}
              >
                <div className={classes.button}>Resume</div>
              </a>
              <a href="#portfolio" className={classes.buttonLink}>
                <div className={classes.button}>Portfolio</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
