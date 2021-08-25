import { makeStyles } from "@material-ui/core"
import React, { useState } from "react"
import { Helmet } from "react-helmet"
import Loader from "./Loader"

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
  const [hidden, setHidden] = useState(true)

  const finishLoading = () => {
    console.log("Hiding loader")
    setHidden(false)
  }
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Gram Liu</title>
      </Helmet>
      <Loader finishLoading={finishLoading} className={classes.loader} />
      <div
        id="children"
        className={classes.container}
        hidden={hidden}
      >
        {children}
      </div>
    </>
  )
}

export default Layout
