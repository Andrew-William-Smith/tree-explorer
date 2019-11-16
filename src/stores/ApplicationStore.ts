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
    /** Whether an explanation is ongoing. */
    explaining: boolean;
    /** Promise values for the current explanation step. */
    explanationPromise: { resolve: any, reject: any } | null;
    /** Title of the ongoing explanation. */
    explanationTitle: string;
    /** Body of the ongoing explanation. */
    explanationBody: React.ReactElement | null;
    /** Whether the current step is the final step of the explanation. */
    explanationTerminal: boolean;
}

export default class ApplicationStore implements IApplicationStore {
    @observable items: Array<number>;
    @observable tree: AbstractTree;

    @observable explainAdd: boolean;
    @observable explainRemove: boolean;
    @observable explaining: boolean;
    explanationPromise: { resolve: any, reject: any } | null;
    @observable explanationTitle: string;
    @observable explanationBody: React.ReactElement | null;
    @observable explanationTerminal: boolean;

    /** Used to display toast notifications within this application. */
    private toaster: IToaster;

    constructor() {
        this.items = [];
        this.tree = new NaiveTree(this.explainStep);

        // Initialise explanation parameters
        this.explainAdd = true;
        this.explainRemove = true;
        this.explaining = false;
        this.explanationPromise = null;
        this.explanationTitle = '';
        this.explanationBody = null;
        this.explanationTerminal = false;

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
            this.explaining = this.explainAdd;
            this.tree.addItem(item, this.explainAdd);
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
        let [removed] = this.items.splice(index, 1);
        this.explaining = this.explainRemove;
        this.tree.removeItem(removed, this.explainRemove);
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

    /**
     * Show a toast message containing the specified message, coloured
     * according to the specified intent and decorated with the specified icon.
     */
    public showToast = (message: string, intent: Intent, icon: IconName) => {
        this.toaster.show({
            'message': message,
            'intent': intent,
            'icon': icon
        });
    }

    /**
     * Show an explanation for a single step of an operation.  If there is no
     * current explanation occurring, pause for a bit to allow animation.
     * 
     * @param title The title of this step.
     * @param explanation A React element explaining what is happening in this
     *     step.
     * @param terminal Whether this is the final step of the operation.
     */
    public explainStep = async (title: string, explanation: React.ReactElement, terminal: boolean = false) => {
        this.explanationTitle = title;
        this.explanationBody = explanation;
        this.explanationTerminal = terminal;

        return new Promise((resolve, reject) => {
            this.explanationPromise = { resolve, reject };
        });
    }
}
