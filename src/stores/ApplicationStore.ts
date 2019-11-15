import { action, observable } from 'mobx';
import { Intent, IToaster, Position, Toaster } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';

/**
 * Trees may contain either Numbers or Strings, as those are the easiest types
 * for which to see collation.
 */
export type TreeItem = Number | String;

export interface IApplicationStore {
    /** Array of all items stored in the current application state. */
    items: Array<TreeItem>;
}

export default class ApplicationStore implements IApplicationStore {
    @observable items: Array<TreeItem>;
    /** Used to display toast notifications within this application. */
    private toaster: IToaster;

    constructor() {
        this.items = [];
        // Show toast notifications in the top right corner
        this.toaster = Toaster.create({
            'position': Position.TOP_RIGHT
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
    public addItem = (item: TreeItem) => {
        if (this.items.includes(item)) {
            this.showToast(`Cannot add duplicate item ${item} to tree.`,
                Intent.WARNING, IconNames.WARNING_SIGN);
        } else {
            this.items.push(item);
        }
    };

    public showToast = (message: String, intent: Intent, icon: IconName) => {
        this.toaster.show({
            'message': message,
            'intent': intent,
            'icon': icon
        });
    }
}