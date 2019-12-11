import React from 'react';

interface INodeColourProps {
    colour: string;
}

export default class NodeColour extends React.Component<INodeColourProps, {}> {
    render(): React.ReactNode {
        return <span style={{fontWeight: 600, color: this.props.colour}}>&#32;{this.props.colour}</span>
    }
}
