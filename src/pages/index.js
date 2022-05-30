import { makeStyles } from "@material-ui/core"
import React, { useState } from "react"
import "src/styles/global.scss"
import About from "../components/About"
import Activities from "../components/Activities"
import Footer from "../components/Footer"
import Home from "../components/Home"
import Loader from "../components/Loader"
import Navbar from "../components/Navbar"
import Portfolio from "../components/Portfolio"

const useStyles = makeStyles((theme) => ({
  loader: {
    height: "100vh",
    width: "100vw",
    position: "absolute"
  }
}))

const IndexPage = () => {
  const classes = useStyles()
  const [hidden, setHidden] = useState(true)

  const finishLoading = () => {
    setHidden(false)
  }
  return (
    <>
      <Loader finishLoading={finishLoading} className={classes.loader} />
      <div hidden={hidden}>
        <Navbar />
        <Home />
        <About />
        <Activities />
        <Portfolio />
        <Footer />
      </div>
    </>
  )
}

export default IndexPage
