import React from 'react'

const TextBlock = (props) => {
    // renders an array of paragraphs (i.e. from ArchieML) as a text block 
    const { paragraphs } = props
    return paragraphs.map((d,i) => 
      <p key={String(i)} dangerouslySetInnerHTML={{ __html: d.value }}></p>
    )
}
export default TextBlock