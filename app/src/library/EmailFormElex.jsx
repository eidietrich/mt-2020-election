import React, { Component } from 'react'

import styles from './EmailForm.module.css'

class EmailFormElex extends Component {
    render(){
      return <div className={styles.containerDark}>
        <div className={styles.message}>Follow MTFP's ongoing election coverage with our free newsletter</div>
        <div className={styles.signup}>
            <form action="https://montanafreepress.us12.list-manage.com/subscribe/post?u=488e8508eb4796685ba32c7a7&amp;id=8a3ae13501" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
                <div className={styles.signupGroup}>
                    <input className={styles.textInput} type="email" placeholder="Email address" name="EMAIL"  id="mce-EMAIL" />
                    <div style={{'position': 'absolute', 'left': '-5000px'}} aria-hidden="true">
                        <input type="text" name="b_488e8508eb4796685ba32c7a7_8a3ae13501" tabIndex="-1" defaultValue="" />
                    </div>
                    <button className={styles.submitButton} type="submit" name="subscribe" id="mc-embedded-subscribe">Subscribe</button>
                </div>
            </form>
        </div>
          
      </div>
    }
  
}

export default EmailFormElex