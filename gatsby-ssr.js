import { ThemeProvider } from "@material-ui/styles"
import React from "react"
import { Scrollbars } from "react-custom-scrollbars"
import "src/styles/global.scss"
import { Fonts } from "src/components/Fonts"
import Layout from "src/components/Layout"
import { theme } from "src/styles/theme"

export const wrapPageElement = ({ element, props }) => {
  return (
    <ThemeProvider theme={theme}>
      <Fonts />
      <Layout {...props}>
        <Scrollbars universal={true}>{element}</Scrollbars>
      </Layout>
    </ThemeProvider>
  )
}
