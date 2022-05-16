module.exports = {
  siteMetadata: {
    siteUrl: "https://gramliu.com/",
    title: "Gram Liu",
    description:
      "Hi! I'm Gram and I build things, from web apps to full stack to IoT. I'm a rising junior at Carnegie Mellon University pursuing a major in Electrical and Computer Engineering. I am a big fan of technology and how it changes the way we think about and address problems from education to health care, consistently pushing the boundaries of what we think is possible."
  },
  plugins: [
    {
      resolve: "gatsby-plugin-google-fonts",
      options: {
        fonts: [
          "Red Hat Display\:300,400,500,600,700,800"
        ]
      }
    },
    {
      resolve: "gatsby-plugin-sass",
      options: {
        sassOptions: {
          includePaths: ["src/styles"]
        }
      }
    },
    {
      resolve: "gatsby-plugin-material-ui",
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [
          "UA-135464080-1" // Google Analytics / GA
        ]
      }
    },
    "gatsby-plugin-smoothscroll",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-styled-components",
    "gatsby-plugin-root-import",
    "gatsby-plugin-gatsby-cloud",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./static/images/"
      },
      __key: "images"
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/"
      },
      __key: "pages"
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "GramLiu",
        short_name: "GramLiu",
        start_url: "/",
        display: "minimal-ui",
        icon: "static/images/logo.png"
      }
    }
  ]
}
