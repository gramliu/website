import React from "react"
import Loader from "./Loader"
import { Helmet } from "react-helmet"
import { makeStyles } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
    width: "100vw",
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
      {/* <Loader finishLoading={finishLoading} /> */}
      <div id="children" className={classes.container}>
        {children}
      </div>
    </>
  )
}

export default Layout
