import React from 'react'

const vidIcon = (props) => {
    const { size, className } = props
    return <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 0 18 18" >
        {/* <path d="M0 0h24v24H0z" fill="none"/> */}
        <path d="M14,10.5V7c0-0.6-0.5-1-1-1H1C0.5,6,0,6.4,0,7v10c0,0.5,0.5,1,1,1h12c0.5,0,1-0.5,1-1v-3.5l4,4v-11L14,10.5z"/>
    </svg>
    // return <svg className={className}
    //     xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 8 8">
    //     <path d="M2.91-.03a1 1 0 0 0-.13.03 1 1 0 0 0-.78 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1.09-1.03zm-2.56 2.03a.5.5 0 0 0-.34.5v.5c0 1.48 1.09 2.69 2.5 2.94v1.06h-.5c-.55 0-1 .45-1 1h4.01c0-.55-.45-1-1-1h-.5v-1.06c1.41-.24 2.5-1.46 2.5-2.94v-.5a.5.5 0 1 0-1 0v.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2v-.5a.5.5 0 0 0-.59-.5.5.5 0 0 0-.06 0z"
    //     transform="translate(1)" />
    // </svg>
}
export default vidIcon