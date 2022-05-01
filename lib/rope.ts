/*
  Note: this file is in typescript, but you do not need to use typings if you don't want.

  The type annotations are just there in case they are helpful.
*/

/*
  Will Howard:
  This is my solution, I have also added another test and pushed it to a git repo: https://github.com/Will-Howard/cea-test-solution
  Typescript is not the main language I use, so the code style might not be completely standard, but I do think I've got the implementation
  basically correct. So if there is a bug, it's not because I ran out of time, it's an actual mistake.

  Overview of implementation:
  For insert(S, k, W):
  - add prepend and append functions for trivial cases
  - else split the rope at position k, and build a new rope from left + W, right
  For deleteRange(S, k, l):
  - split the rope at k (into A), and at l (into B)
  - build new rope from A.left, B.right
  For rebalance(S):
  - collect all the leaves in the rope
  - split the leaves into left and right halves, and recursively build a new rope from leftLeaves, rightLeaves.
  i.e. effectively call rebalance (actually `merge`, to avoid having to rebuild a left and right rope) on leftLeaves and rightLeaves until there are only one or two leaves,
  at which point they can be trivially merged
*/

type MapBranch = {
  left?: MapRepresentation,
  right?: MapRepresentation,
  size: number,
  kind: 'branch'
}
type MapLeaf = {
  text: string,
  kind: 'leaf'
}
type MapRepresentation = MapBranch | MapLeaf

interface IRope {
  toString: () => string,
  size: () => number,
  weight: () => number,
  height: () => number,
  toMap: () => MapRepresentation,
  isBalanced: () => Boolean
  collectLeaves: () => RopeLeaf[],
}

export class RopeLeaf implements IRope {
  text: string;

  // Note: depending on your implementation, you may want to to change this constructor
  constructor(text: string) {
    this.text = text;
  }

  // just prints the stored text
  toString(): string {
    return this.text
  }

  size() {
    return this.text.length;
  }

  weight() {
    return this.size();
  }

  height() {
    return 1;
  }

  toMap(): MapLeaf {
    return {
      text: this.text,
      kind: 'leaf'
    }
  }

  isBalanced() {
    return true;
  }

  collectLeaves() {
    return [this];
  }
}

export class RopeBranch implements IRope {
  left: IRope;
  right: IRope;
  cachedSize: number;
  cachedWeight: number;

  constructor(left: IRope, right: IRope) {
    this.left = left;
    this.right = right;
    // Please note that this is defined differently from "weight" in the Wikipedia article.
    // You may wish to rewrite this property or create a different one.
    this.cachedSize = (left ? left.size() : 0) +
      (right ? right.size() : 0)
    this.cachedWeight = (left ? left.size() : 0)
  }

  // how deep the tree is (I.e. the maximum depth of children)
  height(): number {
    return 1 + Math.max(this.leftHeight(), this.rightHeight())
  }
  
  // Please note that this is defined differently from "weight" in the Wikipedia article.
  // You may wish to rewrite this method or create a different one.
  size() {
    return this.cachedSize;
  }

  weight() {
    return this.cachedWeight;
  }

  /*
    Whether the rope is balanced, i.e. whether any subtrees have branches
    which differ by more than one in height. 
  */
  // NOTE: I haven't checked this implementation too carefully, I'm just assuming it's correct
  isBalanced(): boolean {
    const leftBalanced = this.left ? this.left.isBalanced() : true
    const rightBalanced = this.right ? this.right.isBalanced() : true

    return leftBalanced && rightBalanced
      && Math.abs(this.leftHeight() - this.rightHeight()) < 2
  }

  leftHeight(): number {
    if (!this.left) return 0
    return this.left.height()
  }

  rightHeight(): number {
    if (!this.right) return 0
    return this.right.height()
  }

  // Helper method which converts the rope into an associative array
  // 
  // Only used for debugging, this has no functional purpose
  toMap(): MapBranch {
    const mapVersion: MapBranch = {
      size: this.size(),
      kind: 'branch'
    }
    if (this.right) mapVersion.right = this.right.toMap()
    if (this.left) mapVersion.left = this.left.toMap()
    return mapVersion
  }

  toString(): string {
    return (this.left ? this.left.toString() : '')
      + (this.right ? this.right.toString() : '')
  }

  collectLeaves() {
    return [this.left.collectLeaves(), this.right.collectLeaves()].flat();  // could also do ...
  }
}


export function createRopeFromMap(map: MapRepresentation): IRope {
  if (map.kind === 'leaf') {
    return new RopeLeaf(map.text)
  }

  let left, right = null;
  if (map.left) left = createRopeFromMap(map.left)
  if (map.right) right = createRopeFromMap(map.right)
  return new RopeBranch(left, right);
}

function splitAt(rope: IRope, position: number): { left: IRope, right: IRope } {
  const weight = rope.weight();
  const size = rope.size();

  // if position is out of range, throw an error
  // NOTE: if I was implementing this for an actual use case, I would probably make it gracefully handle this case
  // and return an empty leaf for the left or right node. But nothing about error handling was mentioned in the spec so I'm not going to worry about it too much
  if (position < 0 || position > size) throw "invalid position"

  if (rope instanceof RopeLeaf) {
    // split the string at the position, construct a new rope from the two halves, and return it
    const left = new RopeLeaf(rope.text.slice(0, position));
    const right = new RopeLeaf(rope.text.slice(position));
    return {left: left, right: right};
  } else if (rope instanceof RopeBranch) {
    // if position is equal to rope weight, just return left and right nodes
    // if position is less than weight, call splitAt on left node with same position, then return left.left, concat(left.right, right)
    // if position is greater than weight, call splitAt on right node with (position - root node weight), then return concat(left, right.left), right.right
    if (position === weight) {
      return { left: rope.left, right: rope.right };
    } else if (position < weight) {
      const { left, right } = splitAt(rope.left, position);
      return { left, right: new RopeBranch(right, rope.right) };
    } else {
      const { left, right } = splitAt(rope.right, position - weight);
      return { left: new RopeBranch(rope.left, left), right };
    }
  }
}

function prepend(rope: IRope, text: string): IRope {
  // if leaf, promote to branch, with new string on left, and old string on right
  // if branch, call prepend on left node
  if (rope instanceof RopeLeaf) {
    return new RopeBranch(new RopeLeaf(text), rope);
  } else if (rope instanceof RopeBranch) { // is RopeBranch
    return new RopeBranch(prepend(rope.left, text), rope.right);
  }
}

function append(rope: IRope, text: string) {
  // if leaf, promote to branch, with old string on left, and new string on right
  // if branch, call append on right node
  if (rope instanceof RopeLeaf) {
    return new RopeBranch(rope, new RopeLeaf(text));
  } else if (rope instanceof RopeBranch) { // is RopeBranch
    return new RopeBranch(rope.left, append(rope.right, text));
  }
}

export function deleteRange(rope: IRope, start: number, end: number): IRope {
  // l = split rope at start
  // r = split rope at start + end
  // new RopeBranch(l.left, r.right)
  const size = rope.size()
  if (start < 0 || end > size || end < start) throw "invalid range"
  if (start === end) return rope

  const { left, right } = splitAt(rope, start);
  // I'm doing this because I think it's slightly more efficient, but it would be more readable
  // to do splitAt(rope, end)
  const { right: rightRight } = splitAt(right, end - start);

  return new RopeBranch(left, rightRight);
}

export function insert(rope: IRope, text: string, location: number): IRope {
  // if location == 0, prepend
  // if location == rope.size(), append
  // else, split rope at location, then return new RopeBranch(append(left, text), right)
  if (location === 0) {
    return prepend(rope, text);
  } else if (location === rope.size()) {
    return append(rope, text);
  } else {
    const { left, right } = splitAt(rope, location);
    return new RopeBranch(append(left, text), right);
  }
}

function merge(leaves: RopeLeaf[]): IRope {
  // if there are only one or two leaves, just construct the final rope
  if (leaves.length === 1) return leaves[0];
  if (leaves.length === 2) return new RopeBranch(leaves[0], leaves[1]);

  // else, split the leaves into two (roughly) equal groups, and recurse
  const mid = Math.floor(leaves.length / 2);
  return new RopeBranch(merge(leaves.slice(0, mid)), merge(leaves.slice(mid)));
}

export function rebalance(rope: IRope): IRope {
  // if already balances, return
  // else get a list of all the leaves, and merge them into a balanced rope
  if (rope.isBalanced()) return rope

  const leaves = rope.collectLeaves();
  return merge(leaves);
}
