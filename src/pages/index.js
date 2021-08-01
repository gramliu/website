import { createTheme } from "@material-ui/core/styles"
import { ThemeProvider } from "@material-ui/styles"
import * as React from "react"
import { Scrollbars } from "react-custom-scrollbars"
import "src/styles/global.css"
import About from "../components/About"
import Activities from "../components/Activities"
import { Fonts } from "../components/Fonts"
import Home from "../components/Home"
import Layout from "../components/Layout"

const theme = createTheme({
  palette: {
    background: "#263238",
    textColor: "#e7ecef",
    textAlt: "#f05d5e",
    highlight: "#5bbc6b",
  },
  hoverLink: {
    display: "inline",
    position: "relative",
    overflow: "hidden",

    "&:after": {
      content: "''",
      position: "absolute",
      zIndex: -1,
      right: 0,
      width: 0,
      bottom: "-2px",
      background: "#5bbc6b",
      height: "1px",
      transitionProperty: "width",
      transitionDuration: "0.3s",
      transitionTimingFunction: "ease-out",
    },
    "&:is(:hover,:focus,:active):after": {
      left: 0,
      right: "auto",
      width: "100%",
    },
  },
})

const IndexPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <Fonts />
      <Layout>
        <Scrollbars>
          <Home />
          <About />
          <Activities />
        </Scrollbars>
      </Layout>
    </ThemeProvider>
  )
}

export default IndexPage
