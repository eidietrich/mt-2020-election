import React from "react"
import { Link } from 'gatsby'

import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <h1>NOT FOUND</h1>
    <p>No page here. Return to the guide <Link to="/">landing page</Link> or <a href="https://montanafreepress.org">Montana Free Press homepage</a>.</p>
    
  </Layout>
)

export default NotFoundPage
