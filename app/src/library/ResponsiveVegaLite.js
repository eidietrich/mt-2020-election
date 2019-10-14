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
        return <div ref={this.containerRef}>
                <VegaLite spec={this.props.spec} width={this.state.width} actions={false}/>
            </div>
    }
}
export default ResponsiveVegaLite