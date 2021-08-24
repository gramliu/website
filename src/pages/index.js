import { ThemeProvider } from "@material-ui/styles"
import React, { useState } from "react"
import { Scrollbars } from "react-custom-scrollbars"
import "src/styles/global.css"
import About from "../components/About"
import Activities from "../components/Activities"
import { Fonts } from "../components/Fonts"
import Home from "../components/Home"
import Layout from "../components/Layout"
import Portfolio from "../components/Portfolio"
import { theme } from "../styles/theme"

const IndexPage = () => {
  const [lastScroll, setLastScroll] = useState(0)
  const [slide, setSlide] = useState("0px")

  const handleScroll = () => {
    const currentScroll = window.scrollY
    if (currentScroll > lastScroll) {
      // scrolling down; hide navbar
      console.log("Down")
      setSlide("-5rem")
    } else {
      // scrolling up; show navbar
      console.log("Up")
      setSlide("0px")
    }
    setLastScroll(currentScroll)
  }

  return (
    <ThemeProvider theme={theme}>
      <Fonts />
      <Layout slide={slide}>
        <Scrollbars universal={true} >
          <Home />
          <About />
          <Activities />
          <Portfolio />
        </Scrollbars>
      </Layout>
    </ThemeProvider>
  )
}

export default IndexPage
