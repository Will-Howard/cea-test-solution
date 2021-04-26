export class Rope {
  text: string;
  size: number;
  left?: Rope;
  right?: Rope;

  constructor(text) {
    this.text = text;
    this.size = text.length
  }

  // just prints the stored text
  toString(): string {
    const leftText = this.left ? this.left.toString() : ''
    const rightText = this.right ? this.right.toString() : ''
    return leftText + this.text + rightText
  }

  // How long the text stored is in all of the children combined
  // This is the same as this.toString().length
  totalSize(): number {
    const leftText = this.left ? this.left.totalSize() : 0
    const rightText = this.right ? this.right.totalSize() : 0
    return leftText + this.text.length + rightText
  }

  // how deep the tree is (I.e. the maximum depth of children)
  height(): number {
    return 1 + Math.max(this.leftHeight(), this.rightHeight())
  }

  /*
    Whether the rope is balanced, i.e. whether any subtrees have branches
    which differ by more than one in height. 
  */
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
  toMap(): MapRepresentation {
    const mapVersion: MapRepresentation = {
      text: this.text
    }
    if (this.right) mapVersion.right = this.right.toMap()
    if (this.left) mapVersion.left = this.left.toMap()
    return mapVersion
  }
}

type MapRepresentation = { text: string, left?: MapRepresentation, right?: MapRepresentation }
export function createRopeFromMap(map: MapRepresentation): Rope {
  const rope = new Rope(map.text)
  if (map.left) rope.left = createRopeFromMap(map.left)
  if (map.right) rope.right = createRopeFromMap(map.right)
  return rope;
}

// This is an internal API. You can implement it however you want. 
// (E.g. you can choose to mutate the input rope or not)
function splitAt(rope: Rope, position: number): { left: Rope, right: Rope } {
  // TODO
  return { left: undefined, right: undefined }
}

export function deleteRange(rope: Rope, start: number, end: number): Rope {
  // TODO
  return rope
}

export function insert(rope: Rope, text: string, location: number): Rope {
  // TODO
  return rope
}

export function rebalance(rope: Rope): Rope {
  // TODO
  return rope
}


/*
 Rotates a tree: used for rebalancing.

 Turns:
    b
  /  \
  a   c

  Into:
     c
    /
   b
  /
a   
*/
export function rotateLeft(rope: Rope): Rope {
  const newParent = rope.right
  const newLeft = rope
  newLeft.right = newParent.left
  newParent.left = newLeft
  return newParent
}

/*
 Rotates a tree: used for rebalancing.

 Turns:
    b
  /  \
  a   c

  Into:
     a
      \
       b
        \
         c 
*/
export function rotateRight(rope: Rope): Rope {
  const newParent = rope.left
  const newRight = rope
  newRight.left = newParent.right
  newParent.right = newRight
  return newParent
}
