import React from "react"
import { makeStyles } from "@material-ui/core"
import homePhoto from "../images/homePhoto.jpg"

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    border: "solid black 1px",
    fontSize: "12px",
  },
  dialog: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10%",
    marginRight: "20%",
  },
  portrait: {
    height: "20vh",
    borderRadius: "50%",
  },
  dialogText: {
    marginLeft: "5rem",
    fontSize: "2rem",
  },
  nameLabel: {
    color: "#e65100",
  },
  buttonContainer: {
    marginTop: "2rem",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonLink: {
    fontSize: "1.5rem",
    color: "black",
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
    border: "solid black 1px",
    borderRadius: "5px",
    "&:hover": {
      backgroundColor: "red",
    },
  },
}))

const Home = () => {
  const classes = useStyles({})
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
            Hi! 👋 <br /><br />
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
