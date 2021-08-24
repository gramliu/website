import React from "react"
import "src/styles/global.css"
import About from "../components/About"
import Activities from "../components/Activities"
import Home from "../components/Home"
import Navbar from "../components/Navbar"
import Portfolio from "../components/Portfolio"

const IndexPage = () => {
  return (
    <>
      <Navbar />
      <Home />
      <About />
      <Activities />
      <Portfolio />
    </>
  )
}

export default IndexPage
