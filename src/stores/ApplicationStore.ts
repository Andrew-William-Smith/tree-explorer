import { action, observable } from 'mobx';
import { Intent, IToaster, Position, Toaster } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';
import { AbstractTree } from './AbstractTree';
import NaiveTree from './NaiveTree';

export interface IApplicationStore {
    /** Array of all items stored in the current application state. */
    items: Array<number>;
    /** Tree currently being displayed and modified. */
    tree: AbstractTree;
    /** Whether to explain additions to the tree. */
    explainAdd: boolean;
    /** Whether to explain deletions from the tree. */
    explainRemove: boolean;
}

export default class ApplicationStore implements IApplicationStore {
    @observable items: Array<number>;
    @observable tree: AbstractTree;
    @observable explainAdd: boolean;
    @observable explainRemove: boolean;
    /** Used to display toast notifications within this application. */
    private toaster: IToaster;

    constructor() {
        this.items = [];
        this.tree = new NaiveTree();
        this.explainAdd = true;
        this.explainRemove = true;
        // Show toast notifications in the top right corner
        this.toaster = Toaster.create({
            'position': Position.BOTTOM_RIGHT
        });
    }

    /**
     * Add the specified item to all trees in the current workspace.  If the
     * item already exists in the trees, show a toast notification and do not
     * add.
     * 
     * @param item The item to which to add to the trees.
     */
    @action.bound
    public addItem = (item: number) => {
        if (this.items.includes(item)) {
            this.showToast(`Cannot add duplicate item "${item}" to tree.`,
                Intent.WARNING, IconNames.WARNING_SIGN);
        } else {
            this.items.push(item);
            this.tree.addItem(item, false);
        }
    };

    /**
     * Remove the item at the specified index in the list of items from all
     * trees in the current workspace.
     * 
     * @param index The index whose item to remove.
     */
    @action.bound
    public removeItemAtIndex = (index: number) => {
        this.items.splice(index, 1);
    }

    /**
     * Toggle whether item additions should be explained in detail.
     */
    @action.bound
    public toggleExplainAdd = () => {
        this.explainAdd = !this.explainAdd;
    }

    /**
     * Toggle whether item removals should be explained in detail.
     */
    @action.bound
    public toggleExplainRemove = () => {
        this.explainRemove = !this.explainRemove;
    }

    public showToast = (message: string, intent: Intent, icon: IconName) => {
        this.toaster.show({
            'message': message,
            'intent': intent,
            'icon': icon
        });
    }
}
