import React from 'react';
import { observer, inject } from 'mobx-react';

import { Alignment, Navbar, NavbarGroup, NavbarHeading } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import ApplicationStore from '../stores/ApplicationStore';

interface IAppProps {
    applicationStore?: ApplicationStore
}

@inject('applicationStore')
@observer
export default class App extends React.Component<IAppProps, {}> {
    render(): React.ReactNode {
        return (
            <div className="globalApp">
                <Navbar>
                    <NavbarGroup align={Alignment.LEFT}>
                        <NavbarHeading><strong>Tree Explorer</strong></NavbarHeading>
                    </NavbarGroup>
                    <NavbarGroup align={Alignment.RIGHT}>
                        <a className="ghLink" href="https://github.com/Andrew-William-Smith/tree-explorer" target="_blank" rel="noopener noreferrer">
                            View on GitHub
                        </a>
                    </NavbarGroup>
                </Navbar>
            </div>
        );
    }
}