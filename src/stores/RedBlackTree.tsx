import React from 'react';
import { action } from 'mobx';

import { AbstractTree, BinaryTreeNode } from './AbstractTree';
import HighlightNode, { HighlightColours } from '../components/HighlightNode/HighlightNode';
import NodeColour from '../components/HighlightNode/NodeColour';

export default class RedBlackTree extends AbstractTree {
    private RED: string = 'red';
    private BLACK: string = 'black';

    @action.bound
    public async addItem(item: number): Promise<void> {
        let addedNode = new BinaryTreeNode(item, this.RED);
        await this.addNodeNaive(addedNode, false);

        await this.explainStep('Restore invariants', <div>
            We have now added <strong>{item}</strong> to the tree as a
                <HighlightNode node={addedNode} colour={HighlightColours.GREEN}>red node</HighlightNode>
            ; however, it is possible that as a result of doing so, we have violated
            one of the invariants of the red-black tree.  We shall now rebalance
            the tree to ensure that all invariants hold.
        </div>);

        await this.rebalance(addedNode);
    }

    /**
     * Rebalance this tree to restore all red-black tree invariants:
     * - The root of the tree is black.
     * - If a node is red, its children must be black (red rule).
     * - Every path from a node to a null terminator must contain the same
     *   number of black nodes (path rule).
     *
     * @param node The node relative to which to rebalance this tree.
     */
    @action.bound
    private async rebalance(node: BinaryTreeNode): Promise<void> {
        if (node === this.root) {
            // If this node is the root, colour it black
            node.colour = this.BLACK;
            await this.explainStep('Colour root black', <div>
                Since the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance </HighlightNode>
                is the root of the tree, we shall colour it <NodeColour colour={this.BLACK} />.
            </div>, true);
        } else if (node.parent!.colour === this.BLACK) {
            // If the parent is black, no further modification is necessary
            await this.explainStep('Invariants hold', <div>
                Since the
                    <HighlightNode node={node.parent!} colour={HighlightColours.BLUE}>parent </HighlightNode>
                of this node is <NodeColour colour={this.BLACK} />, the addition of
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>
                        this <NodeColour colour={this.RED} /> node
                    </HighlightNode> does not violate the path rule.  No modification is necessary.
            </div>, true);
        } else if (node.ommer !== null && node.ommer.colour === this.RED) {
            // If the parent and ommer are both red, recolour them black and colour the grandparent red
            await this.explainStep('Recolour parent and uncle', <div>
                We now have the case that the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance</HighlightNode>, its
                    <HighlightNode node={node.parent!} colour={HighlightColours.BLUE}>parent</HighlightNode>, and its
                    <HighlightNode node={node.ommer} colour={HighlightColours.ORANGE}>uncle </HighlightNode>
                are all <NodeColour colour={this.RED} />, a violation of the red rule.
                To rectify this issue, we shall colour both the parent and the uncle <NodeColour colour={this.BLACK} />;
                we shall also recolour the
                    <HighlightNode node={node.grandparent!} colour={HighlightColours.RED}>grandparent </HighlightNode>
                <NodeColour colour={this.RED} /> to maintain the path rule.
            </div>);

            node.ommer.colour = this.BLACK;
            node.parent!.colour = this.BLACK;
            node.grandparent!.colour = this.RED;

            // Continue rebalancing up the tree
            await this.explainStep('Restore invariants from grandparent', <div>
                This recolouring has gotten us closer to a properly coloured tree;
                however, it is possible that recolouring the
                    <HighlightNode node={node.grandparent!} colour={HighlightColours.RED}>grandparent </HighlightNode>
                <NodeColour colour={this.RED} /> has resulted in more invariant violations.
                We shall continue rectifying the tree relative to the grandparent.
            </div>);
            await this.rebalance(node.grandparent!);
        } else {
            // The parent is red but the ommer is black: rotate!
            await this.rebalanceDifferingAntecedents(node);
        }

        this.numOperations++;
    }

    @action.bound
    private async rebalanceDifferingAntecedents(node: BinaryTreeNode): Promise<void> {
        // At this point, we know that there is a grandparent, so let's save some !'s
        let grandparent = node.grandparent!;
        let parent = node.parent!;
        await this.explainStep('Determine rotation direction', <div>
            As the
                <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance </HighlightNode>
            is <NodeColour colour={this.RED} /> but its
                <HighlightNode node={node.ommer!} colour={HighlightColours.ORANGE}>uncle </HighlightNode>
            is <NodeColour colour={this.BLACK} />, this tree currently violates the red rule.
            To rectify this situation, we want to rotate the current node into the position of its
                <HighlightNode node={grandparent} colour={HighlightColours.RED}>grandparent</HighlightNode>
            .
        </div>);

        // Determine which direction to rotate, if any
        let doRotateLeft = (node === parent.rightChild && parent === grandparent.leftChild);
        let doRotateRight = (node === parent.leftChild && parent === grandparent.rightChild);
        if (doRotateLeft || doRotateRight) {
            // The current node is "inside" its grandparent, so we have to rotate
            let rotateDirection = doRotateLeft ? 'left' : 'right';
            await this.explainStep('Rotate outside grandparent', <div>
                The <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance </HighlightNode>
                is "inside" its
                    <HighlightNode node={grandparent} colour={HighlightColours.RED}>grandparent</HighlightNode>
                : that is, it is not reachable by travelling solely {rotateDirection} from the grandparent.
                To prepare to rotate relative to the grandparent, we must first rotate <strong>{rotateDirection}</strong> relative to the
                    <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent</HighlightNode>.
            </div>);
        }

        // If necessary, rotate outward
        if (doRotateLeft)
            await this.rotateLeft(parent);
        else if (doRotateRight)
            await this.rotateRight(parent);

        // Rotate about the grandparent
        await this.explainStep('Rotate about grandparent', <div>
            We are now certain that the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance </HighlightNode>
            is "outside" its
                <HighlightNode node={grandparent} colour={HighlightColours.RED}>grandparent</HighlightNode>
            : the path between these nodes through the rebalanced node's
                <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent </HighlightNode>
            travels exclusively {node === parent.leftChild ? 'left': 'right'}.
            If we now rotate <strong>{node === parent.leftChild ? 'right' : 'left'}</strong> about the grandparent,
            which we know to be <NodeColour colour={this.BLACK} /> by way of the red rule,
            then all that will be required to restore compliance with the red rule is a colour change.
        </div>);

        if (node === parent.leftChild)
            await this.rotateRight(grandparent);
        else
            await this.rotateLeft(grandparent);

        // Recolour old parent and grandparent
        await this.explainStep('Recolour relocated nodes', <div>
            The final step in the rebalancing process is to recolour the
            <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance</HighlightNode>'s old
            <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent</HighlightNode> and
            <HighlightNode node={grandparent} colour={HighlightColours.RED}>grandparent </HighlightNode>
            (now sibling) to restore compliance with the red rule.
            We shall colour the parent <NodeColour colour={this.BLACK} /> and the sibling <NodeColour colour={this.RED} />.
        </div>, true);
        parent.colour = this.BLACK;
        grandparent.colour = this.RED;
    }

    /**
     * Rotate the subtree formed by the specified node left:
     * ```
     *    A             C
     *  B   C   =>   A    E
     *     D E      B D
     * ```
     *
     * @param node The node relative to which to rotate.
     */
    @action.bound
    private async rotateLeft(node: BinaryTreeNode): Promise<void> {
        let oldRight = node.rightChild!;
        let oldParent = node.parent;
        // Determine new right child of rotation node
        await this.explainStep('Promote grandchild', <div>
            We begin this rotation by promoting the
                <HighlightNode node={oldRight.leftChild!} colour={HighlightColours.ORANGE}>left child </HighlightNode>
            of the
                <HighlightNode node={oldRight} colour={HighlightColours.BLUE}>right child </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>rotated node </HighlightNode>
            to be the rotated node's right child.
        </div>);

        node.rightChild = oldRight.leftChild;
        oldRight.leftChild = node;
        node.parent = oldRight;
        if (node.rightChild!.value !== null)
            node.rightChild!.parent = node;

        await this.explainStep('Rotate under right child', <div>
            Now that the
                <HighlightNode node={node.rightChild!} colour={HighlightColours.ORANGE}>proper grandchild </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>rotated node </HighlightNode>
            has been promoted, we must place the rotated node under its old <strong>right child</strong> (not shown).
        </div>);

        // Only subjugate rotated node if it is not the root of the tree
        if (oldParent !== null) {
            if (node === oldParent.leftChild)
                oldParent.leftChild = oldRight;
            else
                oldParent.rightChild = oldRight;
        } else {
            this.root = oldRight;
        }

        // Set the new parent of the promoted node
        oldRight.parent = oldParent;
        await this.explainStep('Rotation complete', <div>
            We have now finished the leftward rotation of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>target node </HighlightNode>
            under its former
                <HighlightNode node={oldRight} colour={HighlightColours.BLUE}>right child</HighlightNode>
            , and can now proceed with our original operation.
        </div>);
    }

    /**
     * Rotate the subtree formed by the specified node right:
     * ```
     *     A            B
     *   B   E   =>   C   A
     *  C D              D E
     * ```
     *
     * @param node The node relative to which to rotate.
     */
    @action.bound
    private async rotateRight(node: BinaryTreeNode): Promise<void> {
        let oldLeft = node.leftChild!;
        let oldParent = node.parent;
        // Determine new right child of rotation node
        await this.explainStep('Promote grandchild', <div>
            We begin this rotation by promoting the
                <HighlightNode node={oldLeft.rightChild!} colour={HighlightColours.ORANGE}>right child </HighlightNode>
            of the
                <HighlightNode node={oldLeft} colour={HighlightColours.BLUE}>left child </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>rotated node </HighlightNode>
            to be the rotated node's left child.
        </div>);

        node.leftChild = oldLeft.rightChild;
        oldLeft.rightChild = node;
        node.parent = oldLeft;
        if (node.leftChild!.value !== null)
            node.leftChild!.parent = node;

        await this.explainStep('Rotate under left child', <div>
            Now that the
                <HighlightNode node={node.leftChild!} colour={HighlightColours.ORANGE}>proper grandchild </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>rotated node </HighlightNode>
            has been promoted, we must place the rotated node under its old <strong>left child</strong> (not shown).
        </div>);

        // Only subjugate rotated node if it is not the root of the tree
        if (oldParent !== null) {
            if (node === oldParent.leftChild)
                oldParent.leftChild = oldLeft;
            else
                oldParent.rightChild = oldLeft;
        } else {
            this.root = oldLeft;
        }

        // Set the new parent of the promoted node
        oldLeft.parent = oldParent;
        await this.explainStep('Rotation complete', <div>
            We have now finished the rightward rotation of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>target node </HighlightNode>
            under its former
                <HighlightNode node={oldLeft} colour={HighlightColours.BLUE}>left child</HighlightNode>
            , and can now proceed with our original operation.
        </div>);
    }

    @action.bound
    public async removeItem(item: number): Promise<void> {
        return;
    }
}
