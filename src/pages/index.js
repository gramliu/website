import "@fontsource/comfortaa"
import { createTheme } from "@material-ui/core/styles"
import { ThemeProvider } from "@material-ui/styles"
import * as React from "react"
import { Home, Layout } from "src/components"
import "src/styles/global.css"

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
      <Layout>
        <Home />
      </Layout>
    </ThemeProvider>
  )
}

export default IndexPage
