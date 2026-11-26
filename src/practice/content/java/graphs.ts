// Practice, Java: Graphs (Q261-Q280). Tests come from the Python content;
// reference solutions in tests/practice/java/graphs.solutions.ts.
import { fromPython } from '../javascript/shared';
import { GRAPHS } from '../python/graphs';
import { javaStarter, one } from './shared';

const UTIL = 'import java.util.*;';
const call = (header: string, comment: string, expr: string, printArray = false) =>
  one(header, comment, printArray ? `System.out.println(Arrays.toString(${expr}));` : `System.out.println(${expr});`, UTIL);
const G2 = 'new int[][] {{1, 2}, {0, 3}, {0, 3}, {1, 2}}';
const HEIGHTS = 'new int[][] {{1, 2, 2, 3, 5}, {3, 2, 3, 4, 4}, {2, 4, 5, 3, 1}, {6, 7, 1, 4, 5}, {5, 1, 1, 2, 4}}';

export const GRAPHS_JAVA = fromPython(GRAPHS, {
  261: {
    example: 'Example: for 3 nodes and the edges {{0, 1}, {1, 2}}, the list is [[1], [0, 2], [1]] and the matrix is [[0, 1, 0], [1, 0, 1], [0, 1, 0]].',
    starter: javaStarter(
      [
        ['List<List<Integer>> toAdjList(int n, int[][] edges)', 'Nodes 0 to n-1, edges {a, b} go both ways. For each node, its neighbours in increasing order.'],
        ['int[][] toAdjMatrix(int n, int[][] edges)', 'An n x n grid: 1 where two nodes are joined by an edge, 0 elsewhere.'],
      ],
      'int[][] edges = {{0, 1}, {1, 2}};\nSystem.out.println(toAdjList(3, edges));\nSystem.out.println(Arrays.deepToString(toAdjMatrix(3, edges)));',
      UTIL,
    ),
    hint: "List: start with n empty lists; for each edge {a, b}, add b to a's list and a to b's list, then sort each list (Collections.sort). Matrix: make new int[n][n] and set m[a][b] and m[b][a] to 1. Like a phone book of who knows whom, versus a big table with a tick wherever two people know each other.",
  },
  262: {
    example: 'Example: bfs(new int[][] {{1, 2}, {0, 3}, {0, 3}, {1, 2}}, 0) returns [0, 1, 2, 3].',
    starter: call(
      'List<Integer> bfs(int[][] adj, int start)',
      'adj[i] lists the neighbours of node i. The nodes in the order breadth-first search\nvisits them from start (neighbours in the order they are listed).',
      `bfs(${G2}, 0)`,
    ),
    hint: 'Use a queue (Queue<Integer> q = new LinkedList<>()) and a boolean[] of seen nodes. Put start in both. Take the front node (poll), record it, and offer each neighbour not seen yet (marking it seen). Like ripples spreading out on a pond: everything one step away first, then two steps, and so on.',
  },
  263: {
    example: 'Example: dfs(new int[][] {{1, 2}, {0, 3}, {0, 3}, {1, 2}}, 0) returns [0, 1, 3, 2].',
    starter: call(
      'List<Integer> dfs(int[][] adj, int start)',
      'The nodes in the order depth-first search visits them from start: go to the first\nunvisited neighbour (in the order listed) and everything reachable from it, before the next.',
      `dfs(${G2}, 0)`,
    ),
  },
  264: {
    example: 'Example: numIslands(new int[][] {{1, 1, 0}, {0, 0, 0}, {0, 1, 1}}) returns 2.',
    starter: call('int numIslands(int[][] grid)', '1 is land, 0 is water. How many islands (land joined up, down, left or right)?', 'numIslands(new int[][] {{1, 1, 0}, {0, 0, 0}, {0, 1, 1}})'),
  },
  265: {
    example: 'Example: maxAreaIsland(new int[][] {{1, 1, 0}, {0, 1, 0}, {0, 0, 1}}) returns 3.',
    starter: call('int maxAreaIsland(int[][] grid)', '1 is land, 0 is water. The number of cells in the biggest island (0 if there is none).', 'maxAreaIsland(new int[][] {{1, 1, 0}, {0, 1, 0}, {0, 0, 1}})'),
  },
  266: {
    example: 'Example: cloneGraph(node) gives new nodes with the same values and the same neighbour links.',
    starter: `import java.util.*;

class Node {
    int val;
    List<Node> neighbors = new ArrayList<>();

    Node(int val) {
        this.val = val;
    }
}

public class Main {
    static Node cloneGraph(Node node) {
        // A deep copy of the connected graph that node is part of (every value is different).
        // Return the copy of node.
        return null;
    }

    public static void main(String[] args) {
        Node a = new Node(1);
        Node b = new Node(2);
        a.neighbors.add(b);
        b.neighbors.add(a);
        Node copy = cloneGraph(a);
        System.out.println(copy != null && copy != a); // true when it makes new nodes
    }
}
`,
    hint: "Keep a HashMap from each value to its copy (every value is different). Visit the graph (DFS or BFS); the first time you meet a node, make its copy; then fill each copy's neighbours with the copies of the old neighbours. The map stops you copying a node twice. Like copying a friendship map: every person is drawn once, then every line between them.",
  },
  267: {
    example: 'Example: hasCycleUndirected(3, new int[][] {{0, 1}, {1, 2}, {2, 0}}) returns true.',
    starter: call('boolean hasCycleUndirected(int n, int[][] edges)', 'Nodes 0 to n-1, edges go both ways (no edge appears twice). true if there is a cycle.', 'hasCycleUndirected(3, new int[][] {{0, 1}, {1, 2}, {2, 0}})'),
  },
  268: {
    example: 'Example: hasCycleDirected(3, new int[][] {{0, 1}, {1, 2}, {2, 0}}) returns true.',
    starter: call('boolean hasCycleDirected(int n, int[][] edges)', 'Nodes 0 to n-1, an edge {a, b} goes from a to b only. true if following edges can loop back.', 'hasCycleDirected(3, new int[][] {{0, 1}, {1, 2}, {2, 0}})'),
  },
  269: {
    example: 'Example: canFinish(2, new int[][] {{1, 0}}) returns true (take course 0, then 1).',
    starter: call('boolean canFinish(int numCourses, int[][] prerequisites)', 'Courses 0 to numCourses-1; {a, b} means b must be taken before a. Can all be finished?', 'canFinish(2, new int[][] {{1, 0}})'),
    hint: 'Count for each course how many courses it still waits for. Start a queue with the courses that wait for none; taking one lowers the count of every course that needs it, and any that reach 0 join the queue. If you take every course this way, the answer is true. Like getting dressed: socks before shoes, and you can only put on what nothing else is waiting for.',
  },
  270: {
    example: 'Example: findOrder(4, new int[][] {{1, 0}, {2, 0}, {3, 1}, {3, 2}}) can return [0, 1, 2, 3] or [0, 2, 1, 3].',
    starter: call('int[] findOrder(int numCourses, int[][] prerequisites)', 'An order to take all courses ({a, b}: b before a), or an empty array if it is impossible.', 'findOrder(4, new int[][] {{1, 0}, {2, 0}, {3, 1}, {3, 2}})', true),
  },
  271: {
    example: 'Example: orangesRotting(new int[][] {{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}) returns 4.',
    starter: call(
      'int orangesRotting(int[][] grid)',
      '0 empty, 1 fresh orange, 2 rotten. Each minute, rotten oranges rot their fresh neighbours\n(up, down, left, right). Minutes until none are fresh, or -1 if some never rot.',
      'orangesRotting(new int[][] {{2, 1, 1}, {1, 1, 0}, {0, 1, 1}})',
    ),
  },
  272: {
    example: 'Example: shortestPathGrid(new int[][] {{0, 0, 0}, {1, 1, 0}, {0, 0, 0}}, new int[] {0, 0}, new int[] {2, 0}) returns 6.',
    starter: call(
      'int shortestPathGrid(int[][] grid, int[] start, int[] end)',
      '0 is open, 1 is a wall; start and end are {row, column}. The fewest moves (up, down, left,\nright) from start to end, or -1 if end can\'t be reached.',
      'shortestPathGrid(new int[][] {{0, 0, 0}, {1, 1, 0}, {0, 0, 0}}, new int[] {0, 0}, new int[] {2, 0})',
    ),
  },
  273: {
    example: 'Example: countComponents(5, new int[][] {{0, 1}, {1, 2}, {3, 4}}) returns 2.',
    starter: call('int countComponents(int n, int[][] edges)', 'Nodes 0 to n-1, edges go both ways. How many separate groups of connected nodes?', 'countComponents(5, new int[][] {{0, 1}, {1, 2}, {3, 4}})'),
  },
  274: {
    example: 'Example: isBipartite(new int[][] {{1, 3}, {0, 2}, {1, 3}, {0, 2}}) returns true.',
    starter: call(
      'boolean isBipartite(int[][] graph)',
      'graph[i] lists the neighbours of node i (edges go both ways). true if every node can get\none of two colours so that no edge joins two nodes of the same colour.',
      'isBipartite(new int[][] {{1, 3}, {0, 2}, {1, 3}, {0, 2}})',
    ),
    hint: 'Colour each uncoloured node 0 and spread out with BFS or DFS, giving each neighbour the other colour (an int[] of colours, -1 for none yet). If a neighbour already has the same colour as the node, the answer is false. Do this for every part of the graph. Like seating guests at two tables so no two who argue sit at the same one.',
  },
  275: {
    example: 'Example: for the heights grid of the island, the cells that can drain to both the top/left edges and the bottom/right edges include [0, 4] and [3, 0].',
    starter: call(
      'List<List<Integer>> flowBothEdges(int[][] heights)',
      'Water flows from a cell to a neighbour (up, down, left, right) with the same or lower height.\nEvery [row, column] from which water can reach the top or left edge AND the bottom or right edge.',
      `flowBothEdges(${HEIGHTS})`,
    ),
  },
  276: {
    example: "Example: an 'O' region that does not touch the border, like the middle of XXX / XOX / XXX, becomes 'X'.",
    starter: one(
      'void captureRegions(char[][] board)',
      "board holds 'X' and 'O'. Change board itself: every region of 'O's (joined up, down,\nleft, right) that does not touch the border becomes 'X'.",
      'char[][] board = {"XXXX".toCharArray(), "XOOX".toCharArray(), "XXOX".toCharArray(), "XOXX".toCharArray()};\ncaptureRegions(board);\nfor (char[] row : board) System.out.println(new String(row));',
    ),
    hint: "The 'O's that survive are the ones joined to the border. Start a search from every 'O' on the border and mark its whole region as safe (for example with 'S'). Then turn every remaining 'O' into 'X' and every 'S' back into 'O'. Like a flood that only drains away from the cells connected to the open sea.",
  },
  277: {
    example: 'Example: dijkstra(3, new int[][] {{0, 1, 5}, {1, 2, 5}, {0, 2, 15}}, 0) returns [0, 5, 10].',
    starter: call(
      'int[] dijkstra(int n, int[][] edges, int src)',
      "Nodes 0 to n-1, edges {a, b, w} go from a to b with length w (w >= 0).\nThe shortest distance from src to every node (-1 if it can't be reached).",
      'dijkstra(3, new int[][] {{0, 1, 5}, {1, 2, 5}, {0, 2, 15}}, 0)',
      true,
    ),
    hint: 'Keep a distance for every node (Integer.MAX_VALUE at first, 0 for src) and a boolean[] of finished nodes. Again and again, pick the unfinished node with the smallest distance (a loop is fine here; a PriorityQueue is the faster way), mark it finished, and let each edge from it give a neighbour a shorter distance. Like planning a road trip by always settling the nearest town you have not finished yet.',
  },
  278: {
    example: 'Example: networkDelay(new int[][] {{2, 1, 1}, {2, 3, 1}, {3, 4, 1}}, 4, 2) returns 2.',
    starter: call(
      'int networkDelay(int[][] times, int n, int k)',
      'Nodes 1 to n; {u, v, w} means a signal takes w minutes from u to v. A signal starts at k.\nHow long until every node has it, or -1 if some node never does?',
      'networkDelay(new int[][] {{2, 1, 1}, {2, 3, 1}, {3, 4, 1}}, 4, 2)',
    ),
    hint: 'Run Dijkstra from k to find when the signal first reaches each node (pick the closest unfinished node each round). The answer is the biggest of those times, or -1 if a node was never reached. Like a phone tree: everyone has heard the news once the slowest branch has passed it on.',
  },
  279: {
    example: 'Example: ladderLength("hit", "cog", new String[] {"hot", "dot", "dog", "lot", "log", "cog"}) returns 5 (hit, hot, dot, dog, cog).',
    starter: call(
      'int ladderLength(String begin, String end, String[] words)',
      'Change one letter at a time; every word after begin must be in words.\nHow many words are in the shortest chain from begin to end (0 if there is none)?',
      'ladderLength("hit", "cog", new String[] {"hot", "dot", "dog", "lot", "log", "cog"})',
    ),
    hint: 'BFS where each word is a node. From a word, try changing each position to every letter a-z; any result in the word set (a HashSet) not seen yet goes into the queue with a chain length one more. Like a word game where each move changes one letter, and you look at all one-move words before any two-move ones.',
  },
  280: {
    example: 'Example: mstWeight(4, new int[][] {{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}}) returns 19.',
    starter: call(
      'int mstWeight(int n, int[][] edges)',
      'Nodes 0 to n-1 (connected), edges {a, b, w} both ways. The total weight of a minimum\nspanning tree: edges joining every node, with the smallest total weight.',
      'mstWeight(4, new int[][] {{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}})',
    ),
    hint: 'Kruskal: sort the edges by weight (Arrays.sort(edges, (x, y) -> x[2] - y[2])) and go through them; keep an edge if its two ends are not joined yet (union-find with an int[] parent), and add its weight. Stop after n - 1 edges. Like connecting villages with roads, always building the cheapest road that links two places not yet connected.',
  },
});
