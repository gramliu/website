import "@fontsource/comfortaa"
import "@fontsource/source-code-pro"
import "src/styles/global.css"
import * as React from "react"
import { createTheme } from "@material-ui/core/styles"
import { ThemeProvider } from "@material-ui/styles"
import { Home, Layout, About } from "src/components"
import { Scrollbars } from "react-custom-scrollbars"
import { Helmet } from "react-helmet"
import { Fonts } from "../components/Fonts"

const theme = createTheme({
  palette: {
    background: "#263238",
    textColor: "#e7ecef",
    textAlt: "#f05d5e",
    highlight: "#5bbc6b",
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
        </Scrollbars>
      </Layout>
    </ThemeProvider>
  )
}

export default IndexPage
