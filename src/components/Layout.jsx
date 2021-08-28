import { makeStyles } from "@material-ui/core"
import React from "react"
import { Helmet } from "react-helmet"

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
    width: "100vw",
  },
}))

const Layout = ({ children }) => {
  const classes = useStyles()

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Gram Liu</title>
      </Helmet>
      <div id="children" className={classes.container}>
        {children}
      </div>
    </>
  )
}

export default Layout
