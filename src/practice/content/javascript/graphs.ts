// Practice, JavaScript: graphs. Tests come from the Python content; reference solutions in tests/practice/js/graphs.solutions.ts.
import { fromPython } from './shared';
import { GRAPHS } from '../python/graphs';

export const GRAPHS_JS = fromPython(GRAPHS, {
  261: {
    example: 'Example: for 3 nodes and the edges [[0, 1], [1, 2]], the array is [[1], [0, 2], [1]] and the matrix is [[0, 1, 0], [1, 0, 1], [0, 1, 0]].',
    starter: `function toAdjList(n, edges) {
  // Nodes 0 to n-1, edges [a, b] go both ways. For each node, its neighbours in increasing order.
}

function toAdjMatrix(n, edges) {
  // An n x n grid: 1 where two nodes are joined by an edge, 0 elsewhere.
}

console.log(toAdjList(3, [[0, 1], [1, 2]]));
console.log(toAdjMatrix(3, [[0, 1], [1, 2]]));
`,
  },
  262: {
    example: 'Example: bfs([[1, 2], [0, 3], [0, 3], [1, 2]], 0) returns [0, 1, 2, 3].',
    starter: `function bfs(adj, start) {
  // adj[i] arrays the neighbours of node i. The nodes in the order breadth-first search
  // visits them from start (neighbours in the order they are listed).
}

console.log(bfs([[1, 2], [0, 3], [0, 3], [1, 2]], 0));
`,
    hint: "Use an array as a queue (push to the back, shift from the front) and a Set of seen nodes. Put start in both. Take the front node, record it, and add each neighbour not seen yet to the back of the queue (marking it seen). Like ripples spreading out on a pond: everything one step away first, then two steps, and so on.",
  },
  263: {
    example: 'Example: dfs([[1, 2], [0, 3], [0, 3], [1, 2]], 0) returns [0, 1, 3, 2].',
    starter: `function dfs(adj, start) {
  // The nodes in the order depth-first search visits them from start: go to the first
  // unvisited neighbour (in the order listed) and everything reachable from it, before the next.
}

console.log(dfs([[1, 2], [0, 3], [0, 3], [1, 2]], 0));
`,
  },
  264: {
    example: 'Example: numIslands([[1, 1, 0], [0, 0, 0], [0, 1, 1]]) returns 2.',
    starter: `function numIslands(grid) {
  // 1 is land, 0 is water. How many islands (land joined up, down, left or right)?
}

console.log(numIslands([[1, 1, 0], [0, 0, 0], [0, 1, 1]]));
`,
  },
  265: {
    example: 'Example: maxAreaIsland([[1, 1, 0], [0, 1, 0], [0, 0, 1]]) returns 3.',
    starter: `function maxAreaIsland(grid) {
  // 1 is land, 0 is water. The number of cells in the biggest island (0 if there is none).
}

console.log(maxAreaIsland([[1, 1, 0], [0, 1, 0], [0, 0, 1]]));
`,
  },
  266: {
    example: 'Example: cloneGraph(node) gives new nodes with the same values and the same neighbour links.',
    starter: `class Node {
  constructor(val = 0, neighbors = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node) {
  // A deep copy of the connected graph that node is part of. Return the copy of node.
}

const a = new Node(1);
const b = new Node(2);
a.neighbors = [b];
b.neighbors = [a];
const copy = cloneGraph(a);
console.log(copy != null && copy !== a); // true when it makes new nodes
`,
    hint: "Keep a Map from each old node to its copy. Visit the graph (DFS or BFS); the first time you meet a node, make its copy; then fill each copy's neighbours with the copies of the old neighbours. The Map stops you copying a node twice. Like copying a friendship map: every person is drawn once, then every line between them.",
  },
  267: {
    example: 'Example: hasCycleUndirected(3, [[0, 1], [1, 2], [2, 0]]) returns true.',
    starter: `function hasCycleUndirected(n, edges) {
  // Nodes 0 to n-1, edges go both ways (no edge appears twice). true if there is a cycle.
}

console.log(hasCycleUndirected(3, [[0, 1], [1, 2], [2, 0]]));
`,
  },
  268: {
    example: 'Example: hasCycleDirected(3, [[0, 1], [1, 2], [2, 0]]) returns true.',
    starter: `function hasCycleDirected(n, edges) {
  // Nodes 0 to n-1, an edge [a, b] goes from a to b only. true if following edges can loop back.
}

console.log(hasCycleDirected(3, [[0, 1], [1, 2], [2, 0]]));
`,
  },
  269: {
    example: 'Example: canFinish(2, [[1, 0]]) returns true (take course 0, then 1).',
    starter: `function canFinish(num_courses, prerequisites) {
  // Courses 0 to num_courses-1; [a, b] means b must be taken before a. Can all be finished?
}

console.log(canFinish(2, [[1, 0]]));
`,
    hint: "Count for each course how many courses it still waits for. Start a queue with the courses that wait for none; taking one lowers the count of every course that needs it, and any that reach 0 join the queue. If you take every course this way, the answer is true. Like getting dressed: socks before shoes, and you can only put on what nothing else is waiting for.",
  },
  270: {
    example: 'Example: findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]]) can return [0, 1, 2, 3] or [0, 2, 1, 3].',
    starter: `function findOrder(num_courses, prerequisites) {
  // An order to take all courses ([a, b]: b before a), or [] if it is impossible.
}

console.log(findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]]));
`,
  },
  271: {
    example: 'Example: orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]) returns 4.',
    starter: `function orangesRotting(grid) {
  // 0 empty, 1 fresh orange, 2 rotten. Each minute, rotten oranges rot their fresh neighbours
  // (up, down, left, right). Minutes until none are fresh, or -1 if some never rot.
}

console.log(orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]));
`,
  },
  272: {
    example: 'Example: shortestPathGrid([[0, 0, 0], [1, 1, 0], [0, 0, 0]], [0, 0], [2, 0]) returns 6.',
    starter: `function shortestPathGrid(grid, start, end) {
  // 0 is open, 1 is a wall; start and end are [row, column]. The fewest moves (up, down, left,
  // right) from start to end, or -1 if end can't be reached.
}

console.log(shortestPathGrid([[0, 0, 0], [1, 1, 0], [0, 0, 0]], [0, 0], [2, 0]));
`,
  },
  273: {
    example: 'Example: countComponents(5, [[0, 1], [1, 2], [3, 4]]) returns 2.',
    starter: `function countComponents(n, edges) {
  // Nodes 0 to n-1, edges go both ways. How many separate groups of connected nodes?
}

console.log(countComponents(5, [[0, 1], [1, 2], [3, 4]]));
`,
  },
  274: {
    example: 'Example: isBipartite([[1, 3], [0, 2], [1, 3], [0, 2]]) returns true.',
    starter: `function isBipartite(graph) {
  // graph[i] arrays the neighbours of node i (edges go both ways). true if every node can get
  // one of two colours so that no edge joins two nodes of the same colour.
}

console.log(isBipartite([[1, 3], [0, 2], [1, 3], [0, 2]]));
`,
    hint: "Colour each uncoloured node 0 and spread out with BFS or DFS, giving each neighbour the other colour. If a neighbour already has the same colour as the node, the answer is false. Do this for every part of the graph. Like seating guests at two tables so no two who argue sit at the same one.",
  },
  275: {
    example: 'Example: for the heights grid of the island, the cells that can drain to both the top/left edges and the bottom/right edges include [0, 4] and [3, 0].',
    starter: `function flowBothEdges(heights) {
  // Water flows from a cell to a neighbour (up, down, left, right) with the same or lower height.
  // Every [row, column] from which water can reach the top or left edge AND the bottom or right edge.
}

console.log(flowBothEdges([[1, 2], [4, 3]]));
`,
  },
  276: {
    example: 'Example: an "O" region that does not touch the border, like the middle of XXX / XOX / XXX, becomes "X".',
    starter: `function captureRegions(board) {
  // board is a array of rows of "X" and "O". Change board itself: every region of "O"s
  // (joined up, down, left, right) that does not touch the border becomes "X".
}

const board = [[..."XXXX"], [..."XOOX"], [..."XXOX"], [..."XOXX"]];
captureRegions(board);
console.log(board);
`,
  },
  277: {
    example: 'Example: dijkstra(3, [[0, 1, 5], [1, 2, 5], [0, 2, 15]], 0) returns [0, 5, 10].',
    starter: `function dijkstra(n, edges, src) {
  // Nodes 0 to n-1, edges [a, b, w] go from a to b with length w (w >= 0).
  // The shortest distance from src to every node (-1 if it can't be reached).
}

console.log(dijkstra(3, [[0, 1, 5], [1, 2, 5], [0, 2, 15]], 0));
`,
    hint: "Keep a distance for every node (Infinity at first, 0 for src) and a set of finished nodes. Again and again, pick the unfinished node with the smallest distance (a simple loop is fine here; big programs use a heap), mark it finished, and let each edge from it give a neighbour a shorter distance. Like planning a road trip by always settling the nearest town you have not finished yet.",
  },
  278: {
    example: 'Example: networkDelay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2) returns 2.',
    starter: `function networkDelay(times, n, k) {
  // Nodes 1 to n; [u, v, w] means a signal takes w minutes from u to v. A signal starts at k.
  // How long until every node has it, or -1 if some node never does?
}

console.log(networkDelay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2));
`,
    hint: "Run Dijkstra from k to find when the signal first reaches each node (pick the closest unfinished node each round). The answer is the biggest of those times, or -1 if a node was never reached. Like a phone tree: everyone has heard the news once the slowest branch has passed it on.",
  },
  279: {
    example: 'Example: ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]) returns 5 (hit, hot, dot, dog, cog).',
    starter: `function ladderLength(begin, end, words) {
  // Change one letter at a time; every word after begin must be in words.
  // How many words are in the shortest chain from begin to end (0 if there is none)?
}

console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]));
`,
    hint: "BFS where each word is a node. From a word, try changing each position to every letter a-z; any result in the word Set not seen yet goes into the queue with a chain length one more. Like a word game where each move changes one letter, and you look at all one-move words before any two-move ones.",
  },
  280: {
    example: 'Example: mstWeight(4, [[0, 1, 10], [0, 2, 6], [0, 3, 5], [1, 3, 15], [2, 3, 4]]) returns 19.',
    starter: `function mstWeight(n, edges) {
  // Nodes 0 to n-1 (connected), edges [a, b, w] both ways. The total weight of a minimum
  // spanning tree: edges joining every node, with the smallest total weight.
}

console.log(mstWeight(4, [[0, 1, 10], [0, 2, 6], [0, 3, 5], [1, 3, 15], [2, 3, 4]]));
`,
    hint: "Kruskal: sort the edges by weight (edges.slice().sort((x, y) => x[2] - y[2])) and go through them; keep an edge if its two ends are not joined yet (union-find), and add its weight. Stop after n - 1 edges. Like connecting villages with roads, always building the cheapest road that links two places not yet connected.",
  },
});
