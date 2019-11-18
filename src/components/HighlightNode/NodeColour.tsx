import React from 'react';

interface INodeColourProps {
    colour: string;
}

export default class NodeColour extends React.Component<INodeColourProps, {}> {
    render(): React.ReactNode {
        return <span style={{fontWeight: 600, color: this.props.colour}}>{this.props.colour}</span>
    }
}
