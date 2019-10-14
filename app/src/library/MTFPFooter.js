import React from 'react'

// Styles stashed in app.css
// TODO: Figure out more modular appraoch - CSS modules don't seem to be working in /library

const MTFPFooter = (props) => {
    return <footer>
        <div>© <a href="https://montanafreepress.org">Montana Free Press</a> {new Date().getFullYear()}</div>
    </footer>
}
export default MTFPFooter 