import {
  insert, deleteRange,
  createRopeFromMap, rebalance
} from '../../lib/rope'

const createLeaf = (text) => createRopeFromMap({
  text,
  kind: 'leaf'
})

/* 
  These tests are here as a starting point, they are not comprehensive
*/
describe("rope basics", () => {
  test("leaf constructor", () => expect(createLeaf('test').toString()).toEqual('test'));
  test("leaf size", () => expect(createLeaf('test').size()).toEqual(4));
  
  const branch = createRopeFromMap({
    kind: 'branch',
    left: {
      left: {
        kind: 'leaf',
        text: 't'
      },
      right: {
        kind: 'leaf',
        text: 'e'
      },
      kind: 'branch'
    },
    right: {
      kind: 'branch',
      right: {
        kind: 'leaf',
        text: 'st'
      }
    }
  })
  test("branch constructor", () => expect(branch.toString()).toEqual('test'));
  test("branch size", () => expect(branch.size()).toEqual(4));
});

describe("insertion", () => {
  test("simple insertion", () => expect(insert(createLeaf('test'), '123', 2).toString()).toEqual('te123st'));
  test("ending insertion", () => expect(insert(createLeaf('test'), '123', 4).toString()).toEqual('test123'));
  test("beginning insertion", () => expect(insert(createLeaf('test'), '123', 0).toString()).toEqual('123test'));
});

describe("deletion", () => {
  test("simple deletion", () => expect(deleteRange(createLeaf('test'), 1, 3).toString()).toEqual('tt'));
  test("delete until end", () => expect(deleteRange(createLeaf('test'), 2, 4).toString()).toEqual('te'));
  test("delete beginning", () => expect(deleteRange(createLeaf('test'), 0, 2).toString()).toEqual('st'));
  test("delete then insert", () => expect(insert(deleteRange(createLeaf('test'), 1, 3), 'abc', 2).toString()).toEqual('ttabc'));
});

describe('Extra Credit: tree is rebalanced', () => {
  expect(rebalance(createRopeFromMap({
    kind: 'branch',
    left: { kind: 'leaf', text: 'a' },
    right: {
      kind: 'branch',
      left: { kind: 'leaf', text: 'b' },
      right: {
        kind: 'branch',
        left: { kind: 'leaf', text: 'c' },
        right: { kind: 'leaf', text: 'd' }
      }
    },
  }))).toEqual(createRopeFromMap({
    kind: 'branch',
    left: {
      kind: 'branch',
      left: { kind:'leaf',text: 'a' },
      right: { kind:'leaf',text: 'b' }
    },
    right: {
      kind: 'branch',
      left: { kind:'leaf',text: 'c' },
      right: { kind:'leaf',text: 'd' }
    },
  }))
})

describe("extra tests", () => {
  test("multiple edge cases", () => {
    // this is not necessarily an example of "good testing practices"
    // I'm just trying to cover as many edge cases as possible with the time I have left
    const base = createLeaf('')
    const insertOnce = insert(base, '123', 0)
    expect(insertOnce.toString()).toEqual('123')

    const insertTwice = insert(insertOnce, '', 3)
    expect(insertTwice.toString()).toEqual('123')

    const rebalanced = rebalance(insertTwice)
    expect(rebalanced.toString()).toEqual('123')

    const deleted = deleteRange(rebalanced, 0, 3)
    expect(deleted.toString()).toEqual('')

    const deletedAgain = deleteRange(deleted, 0, 0)
    expect(deletedAgain.toString()).toEqual('')

    const rebalancedAgain = deleteRange(deletedAgain, 0, 0)
    expect(rebalancedAgain.toString()).toEqual('')

    const insertedAgain = insert(insert(rebalancedAgain, '123', 0), '456', 2)
    expect(insertedAgain.toString()).toEqual('124563')
  });
});
