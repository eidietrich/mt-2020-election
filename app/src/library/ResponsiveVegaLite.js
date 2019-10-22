import React, { Component } from 'react'
import { VegaLite } from 'react-vega';

class ResponsiveVegaLite extends Component {
    // wrapper for VegaLite that sizes chart for component render width
    constructor(props){
        super(props)
        this.state = { width:0 }
        this.containerRef = React.createRef();
    }

    componentDidMount(){
        const width = this.containerRef.current.offsetWidth
        this.setState({width: width})
    }
    
    render() {
        const height = this.props.aspectRatio ? this.props.aspectRatio * this.state.width : null
        return <div ref={this.containerRef} className={this.props.className}
            style={{width: '100%'}}>
                <VegaLite
                    spec={this.props.spec}
                    width={this.state.width}
                    height={height}
                    actions={false}
                    // hover={true}
                />
            </div>
    }
}
export default ResponsiveVegaLite