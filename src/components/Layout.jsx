import React from "react"
import Loader from "./Loader"
import { Helmet } from "react-helmet"
import { makeStyles } from "@material-ui/core"
import Social from "./Social"
import Navbar from "./Navbar"

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
    width: "100vw",
  },
  loader: {
    height: "100vh",
    width: "100vw",
    position: "absolute",
  },
}))

const Layout = ({ children }) => {
  const classes = useStyles()
  const finishLoading = () => {}
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Gram Liu</title>
      </Helmet>
      {/* <Loader finishLoading={finishLoading} className={classes.loader} /> */}
      <Navbar />
      <Social />
      <div id="children" className={classes.container}>
        {children}
      </div>
    </>
  )
}

export default Layout
