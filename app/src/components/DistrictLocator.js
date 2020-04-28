import React, { Component } from 'react'

import styles from './DistrictLocator.module.css'

import DistrictGeocoder from '../logic/DistrictGeocoder'

const senate2020InCycle = [2, 3, 6, 7, 10, 15, 16, 17, 18, 21, 23, 25, 26, 28, 31, 35, 36, 37, 38, 39, 40, 44, 45, 46, 47]

const defaultAddress = 'e.g. 1301 E 6th Ave, Helena, MT 59601'
class DistrictLocator extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: '',
            hasResult: false,
            data: {},
            message: '',
        }

        this.districtGeocoder = new DistrictGeocoder()

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleFailedSubmit = this.handleFailedSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleResult = this.handleResult.bind(this)
    }
    handleChange(event) {
        this.setState({ value: event.target.value })
    }

    handleSubmit(event) {
        event.preventDefault()
        this.districtGeocoder.districtsForAddress(this.state.value, this.handleResult, this.handleFailedSubmit)
    }

    handleResult(data) {
        this.setState({
            hasResult: true,
            data: data,
            message: null,
        })
    }

    handleFailedSubmit() {
        this.setState({
            hasResult: false,
            data: {},
            message: 'Invalid Montana address'
        })
    }

    render() {
        const { data, message, hasResult } = this.state
        const houseDistrict = data.house && data.house.Name.replace('HD','House District ')
        const senateDistrict = data.senate && data.senate.Name.replace('SD','Senate District ')
        const sdNumber = data.senate && data.senate.f6

        const address = data.location && data.location.address

        const inCycle = senate2020InCycle.includes(sdNumber) > 0
        console.log('c', data)

        const enterAddress = !hasResult ? <div>Enter your address</div> : null
        const districtsMessage = hasResult ? <div>{address} is in <strong>{houseDistrict}</strong> and <strong>{senateDistrict}</strong>.</div> : null
        const cycleMessage = hasResult ? <div>{senateDistrict} <strong>is{inCycle ? '' : ' not'} up for election</strong> in 2020.</div> : null

        return <div className={styles.container}>
            <h3>What's my district?</h3>
            <div className={styles.addressForm}>
                <input className={styles.textInput} type="address" value={this.state.value}
                    onChange={this.handleChange}
                    placeholder={defaultAddress} />
                <button className={styles.searchButton} onClick={this.handleSubmit}>LOOK UP</button>
            </div>
            <div className={styles.output}>
            {enterAddress}
            {districtsMessage}
            {cycleMessage}
            {message}
            </div>
        </div>
    }

}

export default DistrictLocator