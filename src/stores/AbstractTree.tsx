import { observable } from 'mobx';

/** Properties of binary tree nodes used exclusively for rendering. */
interface IBinaryTreeNodeRender {
    /** The position of the center-top anchor of this node. */
    topAnchor: { x: number, y: number };
    /** The position of the center-bottom anchor of this node. */
    bottomAnchor: { x: number, y: number };
}

/**
 * A single node within a binary search tree.  Stores a colour to aid in
 * implementing self-balancing trees.
 */
export class BinaryTreeNode {
    /** The value stored in this tree node. */
    value: number | null;
    /** The colour of this node. */
    colour: string;
    /** The subordinate node stored to the left of this node. */
    leftChild: BinaryTreeNode | null;
    /** The subordinate node stored to the right of this node. */
    rightChild: BinaryTreeNode | null;
    /** Rendering properties for this node. */
    renderProps: IBinaryTreeNodeRender;

    constructor(value: number | null, colour: string = "#000") {
        this.value = value;
        this.colour = colour;

        // If the value is non-null, create children
        if (this.value !== null) {
            this.leftChild = new BinaryTreeNode(null);
            this.rightChild = new BinaryTreeNode(null);
        } else {
            this.leftChild = null;
            this.rightChild = null;
        }

        // Set initial rendering properties for this node
        this.renderProps = {
            topAnchor: { x: 0, y: 0 },
            bottomAnchor: { x: 0, y: 0 }
        };
    }
}

/**
 * Some variant of a binary search tree.  Controls tree display, explanation,
 * and any additional properties that must be displayed for the tree.
 */
export abstract class AbstractTree {
    /** The root of this tree. */
    root: BinaryTreeNode;
    /** The size of this tree, used to determine when to rerender. */
    @observable size: number;

    /**
     * Constructor for a binary search tree.  If items are specified, add them
     * to the tree without explanation.
     * 
     * @param items List of items to be added to this binary search tree.
     */
    constructor(items: Array<number> = []) {
        this.root = new BinaryTreeNode(null);
        this.size = 0;
        items.forEach(item => this.addItem(item, false));
    }

    /**
     * Add the specified item to this tree.  It is expected that the tree does
     * not already contain this item.
     *
     * @param item The item to add to this tree.
     * @param explain Whether to explain the steps taken to add the item.
     */
    public abstract addItem(item: number, explain: boolean): void;

    /**
     * Remove the specified item from this tree.  It is expected that the tree
     * contains this item.
     *
     * @param item The item to remove from this tree.
     * @param explain Whether to explain the steps taken to remove the item.
     */
    public abstract removeItem(item: number, explain: boolean): void;
}
