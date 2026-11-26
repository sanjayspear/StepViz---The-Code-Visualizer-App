// Practice, Python: Graphs (Q261-Q280). Reference solutions: tests/practice/graphs.solutions.ts.
import type { PracticeContent } from '../types';

const grid = (rows: string[]) => rows.map((r) => r.split(''));

const ISLAND_1 = [
  [1, 1, 1, 1, 0],
  [1, 1, 0, 1, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0],
];
const ISLAND_2 = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1],
];
const G1 = [[1, 2], [0, 3, 4], [0, 5], [1], [1], [2]];
const G2 = [[1, 2], [0, 3], [0, 3], [1, 2]];
const HEIGHTS = [
  [1, 2, 2, 3, 5],
  [3, 2, 3, 4, 4],
  [2, 4, 5, 3, 1],
  [6, 7, 1, 4, 5],
  [5, 1, 1, 2, 4],
];
const WORDS = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'];

export const GRAPHS: PracticeContent[] = [
  {
    id: 261,
    example: 'Example: for 3 nodes and the edges [[0, 1], [1, 2]], the list is [[1], [0, 2], [1]] and the matrix is [[0, 1, 0], [1, 0, 1], [0, 1, 0]].',
    starter: `def to_adj_list(n, edges):
    # Nodes 0 to n-1, edges [a, b] go both ways. For each node, its neighbours in increasing order.
    pass


def to_adj_matrix(n, edges):
    # An n x n grid: 1 where two nodes are joined by an edge, 0 elsewhere.
    pass


print(to_adj_list(3, [[0, 1], [1, 2]]))
print(to_adj_matrix(3, [[0, 1], [1, 2]]))
`,
    tests: [
      { call: 'to_adj_list', args: [3, [[0, 1], [1, 2]]], expected: [[1], [0, 2], [1]] },
      { call: 'to_adj_matrix', args: [3, [[0, 1], [1, 2]]], expected: [[0, 1, 0], [1, 0, 1], [0, 1, 0]] },
      { call: 'to_adj_list', args: [4, [[0, 3], [2, 1], [0, 1]]], expected: [[1, 3], [0, 2], [1], [0]] },
      { call: 'to_adj_matrix', args: [4, [[0, 3], [2, 1], [0, 1]]], expected: [[0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 0], [1, 0, 0, 0]] },
      { call: 'to_adj_list', args: [2, []], expected: [[], []] },
      { call: 'to_adj_matrix', args: [1, []], expected: [[0]] },
    ],
    hint: 'List: start with n empty lists; for each edge [a, b], add b to a\'s list and a to b\'s list, then sort each list. Matrix: start with n rows of n zeros and set m[a][b] and m[b][a] to 1. Like a phone book of who knows whom, versus a big table with a tick wherever two people know each other.',
  },
  {
    id: 262,
    example: 'Example: bfs([[1, 2], [0, 3], [0, 3], [1, 2]], 0) returns [0, 1, 2, 3].',
    starter: `def bfs(adj, start):
    # adj[i] lists the neighbours of node i. The nodes in the order breadth-first search
    # visits them from start (neighbours in the order they are listed).
    pass


print(bfs([[1, 2], [0, 3], [0, 3], [1, 2]], 0))
`,
    tests: [
      { call: 'bfs', args: [G1, 0], expected: [0, 1, 2, 3, 4, 5] },
      { call: 'bfs', args: [G2, 3], expected: [3, 1, 2, 0] },
      { call: 'bfs', args: [[[1], [0], []], 0], expected: [0, 1] },
      { call: 'bfs', args: [[[]], 0], expected: [0] },
      { call: 'bfs', args: [G1, 5], expected: [5, 2, 0, 1, 3, 4] },
    ],
    hint: 'Use a queue (collections.deque) and a set of seen nodes. Put start in both. Take the front node, record it, and add each neighbour not seen yet to the back of the queue (marking it seen). Like ripples spreading out on a pond: everything one step away first, then two steps, and so on.',
  },
  {
    id: 263,
    example: 'Example: dfs([[1, 2], [0, 3], [0, 3], [1, 2]], 0) returns [0, 1, 3, 2].',
    starter: `def dfs(adj, start):
    # The nodes in the order depth-first search visits them from start: go to the first
    # unvisited neighbour (in the order listed) and everything reachable from it, before the next.
    pass


print(dfs([[1, 2], [0, 3], [0, 3], [1, 2]], 0))
`,
    tests: [
      { call: 'dfs', args: [G2, 0], expected: [0, 1, 3, 2] },
      { call: 'dfs', args: [G1, 0], expected: [0, 1, 3, 4, 2, 5] },
      { call: 'dfs', args: [G2, 3], expected: [3, 1, 0, 2] },
      { call: 'dfs', args: [[[1], [0], []], 0], expected: [0, 1] },
      { call: 'dfs', args: [[[]], 0], expected: [0] },
    ],
    hint: 'A recursive helper visit(node): mark it seen and record it, then call visit on each neighbour that is not seen yet, in order. Like exploring a cave: follow one tunnel to its very end before coming back to try the next one.',
  },
  {
    id: 264,
    example: 'Example: num_islands([[1, 1, 0], [0, 0, 0], [0, 1, 1]]) returns 2.',
    starter: `def num_islands(grid):
    # 1 is land, 0 is water. How many islands (land joined up, down, left or right)?
    pass


print(num_islands([[1, 1, 0], [0, 0, 0], [0, 1, 1]]))
`,
    tests: [
      { call: 'num_islands', args: [ISLAND_1], expected: 1 },
      { call: 'num_islands', args: [ISLAND_2], expected: 3 },
      { call: 'num_islands', args: [[[0]]], expected: 0 },
      { call: 'num_islands', args: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], expected: 5 },
    ],
    hint: 'Go through every cell. When you find land not visited yet, add 1 to the count and visit its whole island (BFS or DFS), marking each land cell so it is not counted again. Like colouring in a map: each time you need a new colour, you have found a new island.',
  },
  {
    id: 265,
    example: 'Example: max_area_island([[1, 1, 0], [0, 1, 0], [0, 0, 1]]) returns 3.',
    starter: `def max_area_island(grid):
    # 1 is land, 0 is water. The number of cells in the biggest island (0 if there is none).
    pass


print(max_area_island([[1, 1, 0], [0, 1, 0], [0, 0, 1]]))
`,
    tests: [
      { call: 'max_area_island', args: [ISLAND_2], expected: 4 },
      { call: 'max_area_island', args: [[[0, 0, 0]]], expected: 0 },
      { call: 'max_area_island', args: [[[1]]], expected: 1 },
      { call: 'max_area_island', args: [[[0, 1, 1], [1, 1, 0], [0, 0, 1]]], expected: 4 },
      { call: 'max_area_island', args: [ISLAND_1], expected: 9 },
    ],
    hint: 'Like counting islands, but the visit returns how many cells it marked. Keep the biggest result. Like measuring every field on a farm map by counting its squares.',
  },
  {
    id: 266,
    example: 'Example: clone_graph(node) gives new nodes with the same values and the same neighbour links.',
    starter: `class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


def clone_graph(node):
    # A deep copy of the connected graph that node is part of. Return the copy of node.
    pass


a, b = Node(1), Node(2)
a.neighbors, b.neighbors = [b], [a]
copy = clone_graph(a)
print(copy is not None and copy is not a)  # True when it makes new nodes
`,
    tests: [
      { call: 'clone_graph', args: [{ $graph: [[2, 4], [1, 3], [2, 4], [1, 3]] }], expected: { $graph: [[2, 4], [1, 3], [2, 4], [1, 3]] }, copy: true },
      { call: 'clone_graph', args: [{ $graph: [[]] }], expected: { $graph: [[]] }, copy: true },
      { call: 'clone_graph', args: [{ $graph: [[2], [1]] }], expected: { $graph: [[2], [1]] }, copy: true },
      { call: 'clone_graph', args: [{ $graph: [] }], expected: null, copy: true },
      { call: 'clone_graph', args: [{ $graph: [[2, 3], [1, 3], [1, 2]] }], expected: { $graph: [[2, 3], [1, 3], [1, 2]] }, copy: true },
    ],
    hint: 'Keep a dictionary from each old node to its copy. Visit the graph (DFS or BFS); the first time you meet a node, make its copy; then fill each copy\'s neighbours with the copies of the old neighbours. The dictionary stops you copying a node twice. Like copying a friendship map: every person is drawn once, then every line between them.',
  },
  {
    id: 267,
    example: 'Example: has_cycle_undirected(3, [[0, 1], [1, 2], [2, 0]]) returns True.',
    starter: `def has_cycle_undirected(n, edges):
    # Nodes 0 to n-1, edges go both ways (no edge appears twice). True if there is a cycle.
    pass


print(has_cycle_undirected(3, [[0, 1], [1, 2], [2, 0]]))
`,
    tests: [
      { call: 'has_cycle_undirected', args: [3, [[0, 1], [1, 2], [2, 0]]], expected: true },
      { call: 'has_cycle_undirected', args: [4, [[0, 1], [1, 2], [2, 3]]], expected: false },
      { call: 'has_cycle_undirected', args: [2, []], expected: false },
      { call: 'has_cycle_undirected', args: [5, [[0, 1], [2, 3], [3, 4], [4, 2]]], expected: true },
      { call: 'has_cycle_undirected', args: [3, [[0, 1], [0, 2]]], expected: false },
    ],
    hint: 'Union-find: give every node its own group. For each edge, if both ends are already in the same group, that edge closes a cycle; otherwise join the two groups. (A DFS that finds a seen neighbour other than the node it came from works too.) Like building a road between two towns that can already reach each other: you have made a loop.',
  },
  {
    id: 268,
    example: 'Example: has_cycle_directed(3, [[0, 1], [1, 2], [2, 0]]) returns True.',
    starter: `def has_cycle_directed(n, edges):
    # Nodes 0 to n-1, an edge [a, b] goes from a to b only. True if following edges can loop back.
    pass


print(has_cycle_directed(3, [[0, 1], [1, 2], [2, 0]]))
`,
    tests: [
      { call: 'has_cycle_directed', args: [3, [[0, 1], [1, 2], [2, 0]]], expected: true },
      { call: 'has_cycle_directed', args: [3, [[0, 1], [0, 2], [1, 2]]], expected: false },
      { call: 'has_cycle_directed', args: [1, [[0, 0]]], expected: true },
      { call: 'has_cycle_directed', args: [4, [[0, 1], [2, 3], [3, 2]]], expected: true },
      { call: 'has_cycle_directed', args: [2, []], expected: false },
    ],
    hint: 'DFS with three states: not visited, on the current path, and finished. Reaching a node that is still on the current path means a loop. (Two arrows into the same node from different paths are fine.) Like following one-way streets with chalk: if you meet your own chalk from this trip, you went round in a circle.',
  },
  {
    id: 269,
    example: 'Example: can_finish(2, [[1, 0]]) returns True (take course 0, then 1).',
    starter: `def can_finish(num_courses, prerequisites):
    # Courses 0 to num_courses-1; [a, b] means b must be taken before a. Can all be finished?
    pass


print(can_finish(2, [[1, 0]]))
`,
    tests: [
      { call: 'can_finish', args: [2, [[1, 0]]], expected: true },
      { call: 'can_finish', args: [2, [[1, 0], [0, 1]]], expected: false },
      { call: 'can_finish', args: [3, []], expected: true },
      { call: 'can_finish', args: [4, [[1, 0], [2, 1], [3, 2], [1, 3]]], expected: false },
      { call: 'can_finish', args: [5, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true },
    ],
    hint: 'Count for each course how many courses it still waits for. Start a queue with the courses that wait for none; taking one lowers the count of every course that needs it, and any that reach 0 join the queue. If you take every course this way, the answer is True. Like getting dressed: socks before shoes, and you can only put on what nothing else is waiting for.',
  },
  {
    id: 270,
    example: 'Example: find_order(4, [[1, 0], [2, 0], [3, 1], [3, 2]]) can return [0, 1, 2, 3] or [0, 2, 1, 3].',
    starter: `def find_order(num_courses, prerequisites):
    # An order to take all courses ([a, b]: b before a), or [] if it is impossible.
    pass


print(find_order(4, [[1, 0], [2, 0], [3, 1], [3, 2]]))
`,
    tests: [
      { call: 'find_order', args: [2, [[1, 0]]], expected: true, compare: 'topo' },
      { call: 'find_order', args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true, compare: 'topo' },
      { call: 'find_order', args: [2, [[1, 0], [0, 1]]], expected: false, compare: 'topo' },
      { call: 'find_order', args: [1, []], expected: true, compare: 'topo' },
      { call: 'find_order', args: [3, []], expected: true, compare: 'topo' },
    ],
    hint: 'The same queue method as "can all courses be finished", but write down each course as you take it. If the list ends up shorter than num_courses, some courses wait for each other in a loop: return []. Like a recipe where you list the steps in an order that never uses something before it is ready.',
  },
  {
    id: 271,
    example: 'Example: oranges_rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]) returns 4.',
    starter: `def oranges_rotting(grid):
    # 0 empty, 1 fresh orange, 2 rotten. Each minute, rotten oranges rot their fresh neighbours
    # (up, down, left, right). Minutes until none are fresh, or -1 if some never rot.
    pass


print(oranges_rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]))
`,
    tests: [
      { call: 'oranges_rotting', args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 },
      { call: 'oranges_rotting', args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1 },
      { call: 'oranges_rotting', args: [[[0, 2]]], expected: 0 },
      { call: 'oranges_rotting', args: [[[0]]], expected: 0 },
      { call: 'oranges_rotting', args: [[[2, 2], [1, 1]]], expected: 1 },
    ],
    hint: 'BFS from all rotten oranges at once: put them all in the queue first. Each round of the queue is one minute; it rots the fresh neighbours and queues them. At the end, if a fresh orange is left, answer -1. Like a rumour spreading from several people at once, one step further every minute.',
  },
  {
    id: 272,
    example: 'Example: shortest_path_grid([[0, 0, 0], [1, 1, 0], [0, 0, 0]], [0, 0], [2, 0]) returns 6.',
    starter: `def shortest_path_grid(grid, start, end):
    # 0 is open, 1 is a wall; start and end are [row, column]. The fewest moves (up, down, left,
    # right) from start to end, or -1 if end can't be reached.
    pass


print(shortest_path_grid([[0, 0, 0], [1, 1, 0], [0, 0, 0]], [0, 0], [2, 0]))
`,
    tests: [
      { call: 'shortest_path_grid', args: [[[0, 0, 0], [1, 1, 0], [0, 0, 0]], [0, 0], [2, 0]], expected: 6 },
      { call: 'shortest_path_grid', args: [[[0, 0], [0, 0]], [0, 0], [1, 1]], expected: 2 },
      { call: 'shortest_path_grid', args: [[[0, 1], [1, 0]], [0, 0], [1, 1]], expected: -1 },
      { call: 'shortest_path_grid', args: [[[0]], [0, 0], [0, 0]], expected: 0 },
      { call: 'shortest_path_grid', args: [[[0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]], [1, 0], [1, 3]], expected: 5 },
    ],
    hint: 'BFS from start, keeping the distance with each cell (or one level at a time). The first time you reach end, that distance is the shortest. Never step into walls, off the grid, or into cells already seen. Like water flooding a maze from the entrance: it reaches each cell by the shortest way first.',
  },
  {
    id: 273,
    example: 'Example: count_components(5, [[0, 1], [1, 2], [3, 4]]) returns 2.',
    starter: `def count_components(n, edges):
    # Nodes 0 to n-1, edges go both ways. How many separate groups of connected nodes?
    pass


print(count_components(5, [[0, 1], [1, 2], [3, 4]]))
`,
    tests: [
      { call: 'count_components', args: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
      { call: 'count_components', args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 1 },
      { call: 'count_components', args: [3, []], expected: 3 },
      { call: 'count_components', args: [1, []], expected: 1 },
      { call: 'count_components', args: [6, [[0, 1], [2, 3], [4, 5], [1, 0]]], expected: 3 },
    ],
    hint: 'Start with n groups (union-find). Every edge that joins two different groups merges them and makes one group fewer. Or: visit each unvisited node with DFS and count how many times you had to start a new visit. Like counting the separate friend circles at a party.',
  },
  {
    id: 274,
    example: 'Example: is_bipartite([[1, 3], [0, 2], [1, 3], [0, 2]]) returns True.',
    starter: `def is_bipartite(graph):
    # graph[i] lists the neighbours of node i (edges go both ways). True if every node can get
    # one of two colours so that no edge joins two nodes of the same colour.
    pass


print(is_bipartite([[1, 3], [0, 2], [1, 3], [0, 2]]))
`,
    tests: [
      { call: 'is_bipartite', args: [[[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]], expected: false },
      { call: 'is_bipartite', args: [[[1, 3], [0, 2], [1, 3], [0, 2]]], expected: true },
      { call: 'is_bipartite', args: [[[]]], expected: true },
      { call: 'is_bipartite', args: [[[1], [0], [3], [2]]], expected: true },
      { call: 'is_bipartite', args: [[[1, 2], [0, 2], [0, 1]]], expected: false },
    ],
    hint: 'Colour each uncoloured node 0 and spread out with BFS or DFS, giving each neighbour the other colour. If a neighbour already has the same colour as the node, the answer is False. Do this for every part of the graph. Like seating guests at two tables so no two who argue sit at the same one.',
  },
  {
    id: 275,
    example: 'Example: for the heights grid of the island, the cells that can drain to both the top/left edges and the bottom/right edges include [0, 4] and [3, 0].',
    starter: `def flow_both_edges(heights):
    # Water flows from a cell to a neighbour (up, down, left, right) with the same or lower height.
    # Every [row, column] from which water can reach the top or left edge AND the bottom or right edge.
    pass


print(flow_both_edges([[1, 2], [4, 3]]))
`,
    tests: [
      { call: 'flow_both_edges', args: [HEIGHTS], expected: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]], compare: 'unordered' },
      { call: 'flow_both_edges', args: [[[1]]], expected: [[0, 0]], compare: 'unordered' },
      { call: 'flow_both_edges', args: [[[2, 1], [1, 2]]], expected: [[0, 0], [0, 1], [1, 0], [1, 1]], compare: 'unordered' },
      { call: 'flow_both_edges', args: [[[1, 2, 3], [8, 9, 4], [7, 6, 5]]], expected: [[0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], compare: 'unordered' },
    ],
    hint: 'Work backwards from the sea: start a search from every cell on the top and left edges and climb to neighbours that are the same height or higher; those cells drain to that side. Do the same from the bottom and right edges. The answer is the cells reached by both searches. Like finding which hillside farms can send rain to two different rivers.',
  },
  {
    id: 276,
    example: 'Example: an "O" region that does not touch the border, like the middle of XXX / XOX / XXX, becomes "X".',
    starter: `def capture_regions(board):
    # board is a list of rows of "X" and "O". Change board itself: every region of "O"s
    # (joined up, down, left, right) that does not touch the border becomes "X".
    pass


board = [list("XXXX"), list("XOOX"), list("XXOX"), list("XOXX")]
capture_regions(board)
print(board)
`,
    tests: [
      { call: 'capture_regions', args: [grid(['XXXX', 'XOOX', 'XXOX', 'XOXX'])], expected: null, mutated: { arg: 0, value: grid(['XXXX', 'XXXX', 'XXXX', 'XOXX']) } },
      { call: 'capture_regions', args: [grid(['X'])], expected: null, mutated: { arg: 0, value: grid(['X']) } },
      { call: 'capture_regions', args: [grid(['OO', 'OO'])], expected: null, mutated: { arg: 0, value: grid(['OO', 'OO']) } },
      { call: 'capture_regions', args: [grid(['XXX', 'XOX', 'XXX'])], expected: null, mutated: { arg: 0, value: grid(['XXX', 'XXX', 'XXX']) } },
      {
        call: 'capture_regions',
        args: [grid(['XOXXX', 'XOOXX', 'XXXOX', 'XOXOX', 'XXXXX'])],
        expected: null,
        mutated: { arg: 0, value: grid(['XOXXX', 'XOOXX', 'XXXXX', 'XXXXX', 'XXXXX']) },
      },
    ],
    hint: 'The "O"s that survive are the ones joined to the border. Start a search from every "O" on the border and mark its whole region as safe (for example with "S"). Then turn every remaining "O" into "X" and every "S" back into "O". Like a flood that only drains away from the cells connected to the open sea.',
  },
  {
    id: 277,
    example: 'Example: dijkstra(3, [[0, 1, 5], [1, 2, 5], [0, 2, 15]], 0) returns [0, 5, 10].',
    starter: `def dijkstra(n, edges, src):
    # Nodes 0 to n-1, edges [a, b, w] go from a to b with length w (w >= 0).
    # The shortest distance from src to every node (-1 if it can't be reached).
    pass


print(dijkstra(3, [[0, 1, 5], [1, 2, 5], [0, 2, 15]], 0))
`,
    tests: [
      { call: 'dijkstra', args: [5, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], 0], expected: [0, 3, 1, 4, -1] },
      { call: 'dijkstra', args: [1, [], 0], expected: [0] },
      { call: 'dijkstra', args: [3, [[0, 1, 5], [1, 2, 5], [0, 2, 15]], 0], expected: [0, 5, 10] },
      { call: 'dijkstra', args: [3, [[1, 0, 1]], 0], expected: [0, -1, -1] },
      { call: 'dijkstra', args: [4, [[3, 0, 2], [3, 1, 7], [0, 1, 3], [1, 2, 1]], 3], expected: [2, 5, 6, 0] },
    ],
    hint: 'Keep a heap (heapq) of (distance, node), starting with (0, src). Pop the closest; if it is already finished, skip it; otherwise its distance is final, and every edge from it may give a neighbour a shorter distance to push. Like planning a road trip by always settling the nearest town you have not finished yet.',
  },
  {
    id: 278,
    example: 'Example: network_delay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2) returns 2.',
    starter: `def network_delay(times, n, k):
    # Nodes 1 to n; [u, v, w] means a signal takes w minutes from u to v. A signal starts at k.
    # How long until every node has it, or -1 if some node never does?
    pass


print(network_delay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2))
`,
    tests: [
      { call: 'network_delay', args: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], expected: 2 },
      { call: 'network_delay', args: [[[1, 2, 1]], 2, 1], expected: 1 },
      { call: 'network_delay', args: [[[1, 2, 1]], 2, 2], expected: -1 },
      { call: 'network_delay', args: [[[1, 2, 1], [2, 3, 2], [1, 3, 4]], 3, 1], expected: 3 },
      { call: 'network_delay', args: [[], 1, 1], expected: 0 },
    ],
    hint: 'Run Dijkstra from k to find when the signal first reaches each node. The answer is the biggest of those times, or -1 if a node was never reached. Like a phone tree: everyone has heard the news once the slowest branch has passed it on.',
  },
  {
    id: 279,
    example: 'Example: ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]) returns 5 (hit, hot, dot, dog, cog).',
    starter: `def ladder_length(begin, end, words):
    # Change one letter at a time; every word after begin must be in words.
    # How many words are in the shortest chain from begin to end (0 if there is none)?
    pass


print(ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]))
`,
    tests: [
      { call: 'ladder_length', args: ['hit', 'cog', WORDS], expected: 5 },
      { call: 'ladder_length', args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], expected: 0 },
      { call: 'ladder_length', args: ['a', 'c', ['a', 'b', 'c']], expected: 2 },
      { call: 'ladder_length', args: ['hot', 'dog', ['hot', 'dog']], expected: 0 },
      { call: 'ladder_length', args: ['hit', 'hot', ['hot']], expected: 2 },
    ],
    hint: 'BFS where each word is a node. From a word, try changing each position to every letter a-z; any result in the word set not seen yet goes into the queue with a chain length one more. Like a word game where each move changes one letter, and you look at all one-move words before any two-move ones.',
  },
  {
    id: 280,
    example: 'Example: mst_weight(4, [[0, 1, 10], [0, 2, 6], [0, 3, 5], [1, 3, 15], [2, 3, 4]]) returns 19.',
    starter: `def mst_weight(n, edges):
    # Nodes 0 to n-1 (connected), edges [a, b, w] both ways. The total weight of a minimum
    # spanning tree: edges joining every node, with the smallest total weight.
    pass


print(mst_weight(4, [[0, 1, 10], [0, 2, 6], [0, 3, 5], [1, 3, 15], [2, 3, 4]]))
`,
    tests: [
      { call: 'mst_weight', args: [4, [[0, 1, 10], [0, 2, 6], [0, 3, 5], [1, 3, 15], [2, 3, 4]]], expected: 19 },
      { call: 'mst_weight', args: [1, []], expected: 0 },
      { call: 'mst_weight', args: [3, [[0, 1, 1], [1, 2, 2], [0, 2, 3]]], expected: 3 },
      { call: 'mst_weight', args: [5, [[0, 1, 2], [0, 3, 6], [1, 2, 3], [1, 3, 8], [1, 4, 5], [2, 4, 7], [3, 4, 9]]], expected: 16 },
    ],
    hint: 'Kruskal: sort the edges by weight and go through them; keep an edge if its two ends are not joined yet (union-find), and add its weight. Stop after n - 1 edges. Like connecting villages with roads, always building the cheapest road that links two places not yet connected.',
  },
];
