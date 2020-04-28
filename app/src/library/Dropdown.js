import React, { Component } from 'react'

import styles from './Dropdown.module.css'

// Ref: https://www.filamentgroup.com/lab/select-css.html

class Dropdown extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null,
    }
    this.handleSelect = this.handleSelect.bind(this)
  }
  handleSelect(e) {
    const key = e.target.value
    this.setState({
      value: key,
    })
  }
  render() {
    const { data, title, defaultMessage } = this.props
    const { value } = this.state
    const options = Object.keys(data)
      .map((key, i) => <option key={String(i)}
        className={styles.listItem}
        onSelect={(e) => console.log(e)}
      >
        {key}
      </option>)

    return <div className={styles.container}>
      <h3>{title}</h3>
      <select className={styles.select} onChange={this.handleSelect}>
        <option>{defaultMessage}</option>
        {options}
      </select>

      <div className={styles.output}>
        {value ? data[value] : null}
      </div>
    </div>
  }

}

export default Dropdown