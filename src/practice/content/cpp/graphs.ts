// Practice, C++: Graphs (Q261-Q280). Tests come from the Python content;
// reference solutions in tests/practice/cpp/graphs.solutions.ts.
// Q266 (clone a graph) needs pointers between objects: it waits for that stage (CPP_LATER).
import { fromPython } from '../javascript/shared';
import { GRAPHS } from '../python/graphs';
import { cppStarter, PRINT_INTS } from './shared';

const PRINT_LISTS = `void printLists(const vector<vector<int>>& lists) {
    for (int i = 0; i < lists.size(); i++) {
        vector<int> row = lists[i];
        printVector(row);
    }
}`;
const HELPERS = `${PRINT_INTS}\n\n${PRINT_LISTS}`;
const fn = (header: string, comment: string, main: string) => cppStarter([[header, comment]], main, ['queue', 'set', 'climits'], HELPERS);
const show = (expr: string) => `cout << ${expr} << endl;`;
const yes = (expr: string) => `cout << boolalpha << ${expr} << endl;`;
const G2 = 'vector<vector<int>> adj = {{1, 2}, {0, 3}, {0, 3}, {1, 2}};';
const grid = (name: string, rows: string) => `vector<vector<int>> ${name} = ${rows};`;

export const GRAPHS_CPP = fromPython(GRAPHS, {
  261: {
    example: 'Example: for 3 nodes and the edges {{0, 1}, {1, 2}}, the list is [[1], [0, 2], [1]] and the matrix is [[0, 1, 0], [1, 0, 1], [0, 1, 0]].',
    starter: cppStarter(
      [
        ['vector<vector<int>> toAdjList(int n, vector<vector<int>> edges)', 'Nodes 0 to n-1, edges {a, b} go both ways. For each node, its neighbours in increasing order.'],
        ['vector<vector<int>> toAdjMatrix(int n, vector<vector<int>> edges)', 'An n x n grid: 1 where two nodes are joined by an edge, 0 elsewhere.'],
      ],
      'vector<vector<int>> edges = {{0, 1}, {1, 2}};\nvector<vector<int>> list = toAdjList(3, edges);\nprintLists(list);\nvector<vector<int>> matrix = toAdjMatrix(3, edges);\nprintLists(matrix);',
      [],
      HELPERS,
    ),
    hint: "List: start with n empty lists (vector<vector<int>> adj(n)); for each edge {a, b}, add b to a's list and a to b's list, then sort each list. Matrix: make vector<vector<int>> m(n, vector<int>(n, 0)) and set m[a][b] and m[b][a] to 1. Like a phone book of who knows whom, versus a big table with a tick wherever two people know each other.",
  },
  262: {
    example: 'Example: bfs({{1, 2}, {0, 3}, {0, 3}, {1, 2}}, 0) returns [0, 1, 2, 3].',
    starter: fn(
      'vector<int> bfs(vector<vector<int>>& adj, int start)',
      'adj[i] lists the neighbours of node i. The nodes in the order breadth-first search\nvisits them from start (neighbours in the order they are listed).',
      `${G2}\nvector<int> r = bfs(adj, 0);\nprintVector(r);`,
    ),
    hint: 'Use a queue<int> and a vector<bool> of seen nodes. Put start in both. Take the front node (front, then pop), record it, and push each neighbour not seen yet (marking it seen). Like ripples spreading out on a pond: everything one step away first, then two steps, and so on.',
  },
  263: {
    example: 'Example: dfs({{1, 2}, {0, 3}, {0, 3}, {1, 2}}, 0) returns [0, 1, 3, 2].',
    starter: fn(
      'vector<int> dfs(vector<vector<int>>& adj, int start)',
      'The nodes in the order depth-first search visits them from start: go to the first\nunvisited neighbour (in the order listed) and everything reachable from it, before the next.',
      `${G2}\nvector<int> r = dfs(adj, 0);\nprintVector(r);`,
    ),
  },
  264: {
    example: 'Example: numIslands({{1, 1, 0}, {0, 0, 0}, {0, 1, 1}}) returns 2.',
    starter: fn('int numIslands(vector<vector<int>> grid)', '1 is land, 0 is water. How many islands (land joined up, down, left or right)?', `${grid('grid', '{{1, 1, 0}, {0, 0, 0}, {0, 1, 1}}')}\n${show('numIslands(grid)')}`),
  },
  265: {
    example: 'Example: maxAreaIsland({{1, 1, 0}, {0, 1, 0}, {0, 0, 1}}) returns 3.',
    starter: fn('int maxAreaIsland(vector<vector<int>> grid)', '1 is land, 0 is water. The number of cells in the biggest island (0 if there is none).', `${grid('grid', '{{1, 1, 0}, {0, 1, 0}, {0, 0, 1}}')}\n${show('maxAreaIsland(grid)')}`),
  },
  266: null,
  267: {
    example: 'Example: hasCycleUndirected(3, {{0, 1}, {1, 2}, {2, 0}}) returns true.',
    starter: fn('bool hasCycleUndirected(int n, vector<vector<int>>& edges)', 'Nodes 0 to n-1, edges go both ways (no edge appears twice). true if there is a cycle.', `${grid('edges', '{{0, 1}, {1, 2}, {2, 0}}')}\n${yes('hasCycleUndirected(3, edges)')}`),
  },
  268: {
    example: 'Example: hasCycleDirected(3, {{0, 1}, {1, 2}, {2, 0}}) returns true.',
    starter: fn('bool hasCycleDirected(int n, vector<vector<int>>& edges)', 'Nodes 0 to n-1, an edge {a, b} goes from a to b only. true if following edges can loop back.', `${grid('edges', '{{0, 1}, {1, 2}, {2, 0}}')}\n${yes('hasCycleDirected(3, edges)')}`),
  },
  269: {
    example: 'Example: canFinish(2, {{1, 0}}) returns true (take course 0, then 1).',
    starter: fn('bool canFinish(int numCourses, vector<vector<int>>& prerequisites)', 'Courses 0 to numCourses-1; {a, b} means b must be taken before a. Can all be finished?', `${grid('prerequisites', '{{1, 0}}')}\n${yes('canFinish(2, prerequisites)')}`),
    hint: 'Count for each course how many courses it still waits for. Start a queue with the courses that wait for none; taking one lowers the count of every course that needs it, and any that reach 0 join the queue. If you take every course this way, the answer is true. Like getting dressed: socks before shoes, and you can only put on what nothing else is waiting for.',
  },
  270: {
    example: 'Example: findOrder(4, {{1, 0}, {2, 0}, {3, 1}, {3, 2}}) can return [0, 1, 2, 3] or [0, 2, 1, 3].',
    starter: fn(
      'vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites)',
      'An order to take all courses ({a, b}: b before a), or an empty vector if it is impossible.',
      `${grid('prerequisites', '{{1, 0}, {2, 0}, {3, 1}, {3, 2}}')}\nvector<int> r = findOrder(4, prerequisites);\nprintVector(r);`,
    ),
  },
  271: {
    example: 'Example: orangesRotting({{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}) returns 4.',
    starter: fn(
      'int orangesRotting(vector<vector<int>> grid)',
      '0 empty, 1 fresh orange, 2 rotten. Each minute, rotten oranges rot their fresh neighbours\n(up, down, left, right). Minutes until none are fresh, or -1 if some never rot.',
      `${grid('grid', '{{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}')}\n${show('orangesRotting(grid)')}`,
    ),
  },
  272: {
    example: 'Example: shortestPathGrid({{0, 0, 0}, {1, 1, 0}, {0, 0, 0}}, {0, 0}, {2, 0}) returns 6.',
    starter: fn(
      'int shortestPathGrid(vector<vector<int>>& grid, vector<int> start, vector<int> end)',
      "0 is open, 1 is a wall; start and end are {row, column}. The fewest moves (up, down, left,\nright) from start to end, or -1 if end can't be reached.",
      `${grid('grid', '{{0, 0, 0}, {1, 1, 0}, {0, 0, 0}}')}\nvector<int> start = {0, 0};\nvector<int> end = {2, 0};\n${show('shortestPathGrid(grid, start, end)')}`,
    ),
  },
  273: {
    example: 'Example: countComponents(5, {{0, 1}, {1, 2}, {3, 4}}) returns 2.',
    starter: fn('int countComponents(int n, vector<vector<int>>& edges)', 'Nodes 0 to n-1, edges go both ways. How many separate groups of connected nodes?', `${grid('edges', '{{0, 1}, {1, 2}, {3, 4}}')}\n${show('countComponents(5, edges)')}`),
  },
  274: {
    example: 'Example: isBipartite({{1, 3}, {0, 2}, {1, 3}, {0, 2}}) returns true.',
    starter: fn(
      'bool isBipartite(vector<vector<int>>& graph)',
      'graph[i] lists the neighbours of node i (edges go both ways). true if every node can get\none of two colours so that no edge joins two nodes of the same colour.',
      `${grid('graph', '{{1, 3}, {0, 2}, {1, 3}, {0, 2}}')}\n${yes('isBipartite(graph)')}`,
    ),
    hint: 'Colour each uncoloured node 0 and spread out with BFS or DFS, giving each neighbour the other colour (a vector<int> of colours, -1 for none yet). If a neighbour already has the same colour as the node, the answer is false. Do this for every part of the graph. Like seating guests at two tables so no two who argue sit at the same one.',
  },
  275: {
    example: 'Example: for the heights grid of the island, the cells that can drain to both the top/left edges and the bottom/right edges include [0, 4] and [3, 0].',
    starter: fn(
      'vector<vector<int>> flowBothEdges(vector<vector<int>>& heights)',
      'Water flows from a cell to a neighbour (up, down, left, right) with the same or lower height.\nEvery {row, column} from which water can reach the top or left edge AND the bottom or right edge.',
      `${grid('heights', '{{1, 2, 2, 3, 5}, {3, 2, 3, 4, 4}, {2, 4, 5, 3, 1}, {6, 7, 1, 4, 5}, {5, 1, 1, 2, 4}}')}\nvector<vector<int>> r = flowBothEdges(heights);\nprintLists(r);`,
    ),
  },
  276: {
    example: "Example: an 'O' region that does not touch the border, like the middle of XXX / XOX / XXX, becomes 'X'.",
    starter: fn(
      'void captureRegions(vector<vector<char>>& board)',
      "board holds 'X' and 'O'. Change board itself: every region of 'O's (joined up, down,\nleft, right) that does not touch the border becomes 'X'.",
      "vector<vector<char>> board = {{'X', 'X', 'X', 'X'}, {'X', 'O', 'O', 'X'}, {'X', 'X', 'O', 'X'}, {'X', 'O', 'X', 'X'}};\ncaptureRegions(board);\nfor (int r = 0; r < board.size(); r++) {\n    for (char ch : board[r]) cout << ch;\n    cout << endl;\n}",
    ),
    hint: "The 'O's that survive are the ones joined to the border. Start a search from every 'O' on the border and mark its whole region as safe (for example with 'S'). Then turn every remaining 'O' into 'X' and every 'S' back into 'O'. Like a flood that only drains away from the cells connected to the open sea.",
  },
  277: {
    example: 'Example: dijkstra(3, {{0, 1, 5}, {1, 2, 5}, {0, 2, 15}}, 0) returns [0, 5, 10].',
    starter: fn(
      'vector<int> dijkstra(int n, vector<vector<int>>& edges, int src)',
      "Nodes 0 to n-1, edges {a, b, w} go from a to b with length w (w >= 0).\nThe shortest distance from src to every node (-1 if it can't be reached).",
      `${grid('edges', '{{0, 1, 5}, {1, 2, 5}, {0, 2, 15}}')}\nvector<int> r = dijkstra(3, edges, 0);\nprintVector(r);`,
    ),
    hint: 'Keep a distance for every node (INT_MAX at first, 0 for src) and a vector<bool> of finished nodes. Again and again, pick the unfinished node with the smallest distance (a loop is fine here; a priority_queue is the faster way), mark it finished, and let each edge from it give a neighbour a shorter distance. Like planning a road trip by always settling the nearest town you have not finished yet.',
  },
  278: {
    example: 'Example: networkDelay({{2, 1, 1}, {2, 3, 1}, {3, 4, 1}}, 4, 2) returns 2.',
    starter: fn(
      'int networkDelay(vector<vector<int>>& times, int n, int k)',
      'Nodes 1 to n; {u, v, w} means a signal takes w minutes from u to v. A signal starts at k.\nHow long until every node has it, or -1 if some node never does?',
      `${grid('times', '{{2, 1, 1}, {2, 3, 1}, {3, 4, 1}}')}\n${show('networkDelay(times, 4, 2)')}`,
    ),
    hint: 'Run Dijkstra from k to find when the signal first reaches each node (pick the closest unfinished node each round). The answer is the biggest of those times, or -1 if a node was never reached. Like a phone tree: everyone has heard the news once the slowest branch has passed it on.',
  },
  279: {
    example: 'Example: ladderLength("hit", "cog", {"hot", "dot", "dog", "lot", "log", "cog"}) returns 5 (hit, hot, dot, dog, cog).',
    starter: fn(
      'int ladderLength(string begin, string end, vector<string> words)',
      'Change one letter at a time; every word after begin must be in words.\nHow many words are in the shortest chain from begin to end (0 if there is none)?',
      'vector<string> words = {"hot", "dot", "dog", "lot", "log", "cog"};\ncout << ladderLength("hit", "cog", words) << endl;',
    ),
    hint: 'BFS where each word is a node. From a word, try changing each position to every letter a-z; any result in the word set (a set<string>) not seen yet goes into the queue with a chain length one more. Like a word game where each move changes one letter, and you look at all one-move words before any two-move ones.',
  },
  280: {
    example: 'Example: mstWeight(4, {{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}}) returns 19.',
    starter: fn(
      'int mstWeight(int n, vector<vector<int>> edges)',
      'Nodes 0 to n-1 (connected), edges {a, b, w} both ways. The total weight of a minimum\nspanning tree: edges joining every node, with the smallest total weight.',
      `${grid('edges', '{{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}}')}\n${show('mstWeight(4, edges)')}`,
    ),
    hint: 'Kruskal: sort the edges by weight (sort with a lambda comparing x[2] < y[2]) and go through them; keep an edge if its two ends are not joined yet (union-find with a vector<int> parent), and add its weight. Stop after n - 1 edges. Like connecting villages with roads, always building the cheapest road that links two places not yet connected.',
  },
});
