import React from "react"
import { makeStyles, useTheme } from "@material-ui/core"
import homePhoto from "../../images/homePhoto.jpg"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
  },
  dialog: {
    display: "flex",
    alignItems: "center",
    marginTop: "18%",
    marginRight: "20%",
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
  },
  nameLabel: {
    color: theme.palette.textAlt,
  },
  buttonContainer: {
    marginTop: "2rem",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonLink: {
    fontSize: "1.5rem",
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
    padding: "0.5rem",
    border: `solid ${theme.palette.textColor} 1px`,
    borderRadius: "5px",
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
              src={homePhoto}
              alt="Picture of me"
              className={classes.portrait}
            />
          </div>
          <div className={classes.dialogText}>
            Hi! 👋 <br />
            <br />
            I'm <span className={classes.nameLabel}>Gram Liu.</span>
            <br />I build things.
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
