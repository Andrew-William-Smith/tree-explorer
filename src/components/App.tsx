import React from 'react';
import { observer, inject } from 'mobx-react';

import { Alignment, Navbar, NavbarGroup, NavbarHeading, Tab, Tabs } from '@blueprintjs/core';

import ApplicationStore from '../stores/ApplicationStore';
import Sidebar from './Sidebar/Sidebar';
import TreeDisplay from './TreeDisplay/TreeDisplay';

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
                    <NavbarGroup className="treeTypeTabs" align={Alignment.LEFT}>
                        <Tabs animate large>
                            <Tab id="naiveTree">Na&iuml;ve Tree</Tab>
                            <Tab id="redBlackTree">Red/Black Tree</Tab>
                            <Tab id="avlTree">AVL Tree</Tab>
                        </Tabs>
                    </NavbarGroup>
                    <NavbarGroup align={Alignment.RIGHT}>
                        <a className="ghLink" href="https://github.com/Andrew-William-Smith/tree-explorer" target="_blank" rel="noopener noreferrer">
                            View on GitHub
                        </a>
                    </NavbarGroup>
                </Navbar>
                <div className="appBody">
                    <TreeDisplay />
                    <Sidebar />
                </div>
            </div>
        );
    }
}
