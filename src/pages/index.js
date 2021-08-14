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
import { theme } from "../styles/theme"

const IndexPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <Fonts />
      <Layout>
        <Scrollbars universal={true}>
          <Home />
          <About />
          <Activities />
        </Scrollbars>
      </Layout>
    </ThemeProvider>
  )
}

export default IndexPage
