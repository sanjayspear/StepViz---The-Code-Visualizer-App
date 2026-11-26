// Java reference solutions for Practice: Graphs. Never shipped to students.
const main = (methods: string, before = '') => `import java.util.*;
${before}
public class Main {
${methods}
    public static void main(String[] args) {
    }
}
`;
const FIND = `    static int find(int[] parent, int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
`;
const ISLANDS = `    static int fill(int[][] grid, boolean[][] seen, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != 1 || seen[r][c]) return 0;
        seen[r][c] = true;
        return 1 + fill(grid, seen, r + 1, c) + fill(grid, seen, r - 1, c) + fill(grid, seen, r, c + 1) + fill(grid, seen, r, c - 1);
    }
`;
const ORDER = `    static List<Integer> order(int numCourses, int[][] prerequisites) {
        int[] waits = new int[numCourses];
        List<List<Integer>> neededBy = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) neededBy.add(new ArrayList<>());
        for (int[] p : prerequisites) {
            waits[p[0]]++;
            neededBy.get(p[1]).add(p[0]);
        }
        Queue<Integer> q = new LinkedList<>();
        for (int c = 0; c < numCourses; c++) {
            if (waits[c] == 0) q.offer(c);
        }
        List<Integer> out = new ArrayList<>();
        while (!q.isEmpty()) {
            int c = q.poll();
            out.add(c);
            for (int d : neededBy.get(c)) {
                waits[d]--;
                if (waits[d] == 0) q.offer(d);
            }
        }
        return out;
    }
`;
const DIJKSTRA = `    static int[] shortest(int n, int[][] edges, int src, int base) {
        int[] dist = new int[n];
        boolean[] done = new boolean[n];
        for (int i = 0; i < n; i++) dist[i] = Integer.MAX_VALUE;
        dist[src] = 0;
        for (int round = 0; round < n; round++) {
            int u = -1;
            for (int v = 0; v < n; v++) {
                if (!done[v] && dist[v] != Integer.MAX_VALUE && (u == -1 || dist[v] < dist[u])) u = v;
            }
            if (u == -1) break;
            done[u] = true;
            for (int[] e : edges) {
                int a = e[0] - base;
                int b = e[1] - base;
                if (a == u && dist[u] + e[2] < dist[b]) dist[b] = dist[u] + e[2];
            }
        }
        return dist;
    }
`;

export const SOLUTIONS: Record<number, string> = {
  261: main(`    static List<List<Integer>> toAdjList(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }
        for (List<Integer> list : adj) Collections.sort(list);
        return adj;
    }

    static int[][] toAdjMatrix(int n, int[][] edges) {
        int[][] m = new int[n][n];
        for (int[] e : edges) {
            m[e[0]][e[1]] = 1;
            m[e[1]][e[0]] = 1;
        }
        return m;
    }
`),
  262: main(`    static List<Integer> bfs(int[][] adj, int start) {
        boolean[] seen = new boolean[adj.length];
        List<Integer> order = new ArrayList<>();
        Queue<Integer> q = new LinkedList<>();
        q.offer(start);
        seen[start] = true;
        while (!q.isEmpty()) {
            int node = q.poll();
            order.add(node);
            for (int nb : adj[node]) {
                if (!seen[nb]) {
                    seen[nb] = true;
                    q.offer(nb);
                }
            }
        }
        return order;
    }
`),
  263: main(`    static void visit(int[][] adj, int node, boolean[] seen, List<Integer> order) {
        seen[node] = true;
        order.add(node);
        for (int nb : adj[node]) {
            if (!seen[nb]) visit(adj, nb, seen, order);
        }
    }

    static List<Integer> dfs(int[][] adj, int start) {
        List<Integer> order = new ArrayList<>();
        visit(adj, start, new boolean[adj.length], order);
        return order;
    }
`),
  264: main(`${ISLANDS}
    static int numIslands(int[][] grid) {
        boolean[][] seen = new boolean[grid.length][grid[0].length];
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (fill(grid, seen, r, c) > 0) count++;
            }
        }
        return count;
    }
`),
  265: main(`${ISLANDS}
    static int maxAreaIsland(int[][] grid) {
        boolean[][] seen = new boolean[grid.length][grid[0].length];
        int best = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) best = Math.max(best, fill(grid, seen, r, c));
        }
        return best;
    }
`),
  266: main(
    `    static Node copy(Node n, Map<Integer, Node> copies) {
        if (copies.containsKey(n.val)) return copies.get(n.val);
        Node c = new Node(n.val);
        copies.put(n.val, c);
        for (Node nb : n.neighbors) c.neighbors.add(copy(nb, copies));
        return c;
    }

    static Node cloneGraph(Node node) {
        if (node == null) return null;
        return copy(node, new HashMap<>());
    }
`,
    `
class Node {
    int val;
    List<Node> neighbors = new ArrayList<>();

    Node(int val) {
        this.val = val;
    }
}
`,
  ),
  267: main(`${FIND}
    static boolean hasCycleUndirected(int n, int[][] edges) {
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int[] e : edges) {
            int a = find(parent, e[0]);
            int b = find(parent, e[1]);
            if (a == b) return true;
            parent[a] = b;
        }
        return false;
    }
`),
  268: main(`    static boolean visit(List<List<Integer>> adj, int u, int[] state) {
        state[u] = 1;
        for (int v : adj.get(u)) {
            if (state[v] == 1) return true;
            if (state[v] == 0 && visit(adj, v, state)) return true;
        }
        state[u] = 2;
        return false;
    }

    static boolean hasCycleDirected(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) adj.get(e[0]).add(e[1]);
        int[] state = new int[n];
        for (int u = 0; u < n; u++) {
            if (state[u] == 0 && visit(adj, u, state)) return true;
        }
        return false;
    }
`),
  269: main(`${ORDER}
    static boolean canFinish(int numCourses, int[][] prerequisites) {
        return order(numCourses, prerequisites).size() == numCourses;
    }
`),
  270: main(`${ORDER}
    static int[] findOrder(int numCourses, int[][] prerequisites) {
        List<Integer> o = order(numCourses, prerequisites);
        if (o.size() != numCourses) return new int[0];
        int[] out = new int[o.size()];
        for (int i = 0; i < out.length; i++) out[i] = o.get(i);
        return out;
    }
`),
  271: main(`    static int orangesRotting(int[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;
        Queue<Integer> rotten = new LinkedList<>();
        int fresh = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) rotten.offer(r * cols + c);
                if (grid[r][c] == 1) fresh++;
            }
        }
        int minutes = 0;
        int[] dr = {1, -1, 0, 0};
        int[] dc = {0, 0, 1, -1};
        while (!rotten.isEmpty() && fresh > 0) {
            int size = rotten.size();
            for (int i = 0; i < size; i++) {
                int cell = rotten.poll();
                for (int k = 0; k < 4; k++) {
                    int x = cell / cols + dr[k];
                    int y = cell % cols + dc[k];
                    if (x >= 0 && x < rows && y >= 0 && y < cols && grid[x][y] == 1) {
                        grid[x][y] = 2;
                        fresh--;
                        rotten.offer(x * cols + y);
                    }
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
`),
  272: main(`    static int shortestPathGrid(int[][] grid, int[] start, int[] end) {
        int rows = grid.length;
        int cols = grid[0].length;
        if (grid[start[0]][start[1]] == 1) return -1;
        int[][] dist = new int[rows][cols];
        for (int[] row : dist) {
            for (int c = 0; c < cols; c++) row[c] = -1;
        }
        Queue<Integer> q = new LinkedList<>();
        q.offer(start[0] * cols + start[1]);
        dist[start[0]][start[1]] = 0;
        int[] dr = {1, -1, 0, 0};
        int[] dc = {0, 0, 1, -1};
        while (!q.isEmpty()) {
            int cell = q.poll();
            int a = cell / cols;
            int b = cell % cols;
            if (a == end[0] && b == end[1]) return dist[a][b];
            for (int k = 0; k < 4; k++) {
                int x = a + dr[k];
                int y = b + dc[k];
                if (x >= 0 && x < rows && y >= 0 && y < cols && grid[x][y] == 0 && dist[x][y] == -1) {
                    dist[x][y] = dist[a][b] + 1;
                    q.offer(x * cols + y);
                }
            }
        }
        return -1;
    }
`),
  273: main(`${FIND}
    static int countComponents(int n, int[][] edges) {
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int groups = n;
        for (int[] e : edges) {
            int a = find(parent, e[0]);
            int b = find(parent, e[1]);
            if (a != b) {
                parent[a] = b;
                groups--;
            }
        }
        return groups;
    }
`),
  274: main(`    static boolean isBipartite(int[][] graph) {
        int[] colour = new int[graph.length];
        for (int i = 0; i < colour.length; i++) colour[i] = -1;
        for (int s = 0; s < graph.length; s++) {
            if (colour[s] != -1) continue;
            colour[s] = 0;
            Stack<Integer> stack = new Stack<>();
            stack.push(s);
            while (!stack.isEmpty()) {
                int u = stack.pop();
                for (int v : graph[u]) {
                    if (colour[v] == -1) {
                        colour[v] = 1 - colour[u];
                        stack.push(v);
                    } else if (colour[v] == colour[u]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
`),
  275: main(`    static void reach(int[][] h, int r, int c, boolean[][] seen) {
        seen[r][c] = true;
        int[] dr = {1, -1, 0, 0};
        int[] dc = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int x = r + dr[k];
            int y = c + dc[k];
            if (x >= 0 && x < h.length && y >= 0 && y < h[0].length && !seen[x][y] && h[x][y] >= h[r][c]) reach(h, x, y, seen);
        }
    }

    static List<List<Integer>> flowBothEdges(int[][] heights) {
        int rows = heights.length;
        int cols = heights[0].length;
        boolean[][] tl = new boolean[rows][cols];
        boolean[][] br = new boolean[rows][cols];
        for (int c = 0; c < cols; c++) {
            if (!tl[0][c]) reach(heights, 0, c, tl);
            if (!br[rows - 1][c]) reach(heights, rows - 1, c, br);
        }
        for (int r = 0; r < rows; r++) {
            if (!tl[r][0]) reach(heights, r, 0, tl);
            if (!br[r][cols - 1]) reach(heights, r, cols - 1, br);
        }
        List<List<Integer>> out = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (tl[r][c] && br[r][c]) {
                    List<Integer> cell = new ArrayList<>();
                    cell.add(r);
                    cell.add(c);
                    out.add(cell);
                }
            }
        }
        return out;
    }
`),
  276: main(`    static void mark(char[][] board, int r, int c) {
        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || board[r][c] != 'O') return;
        board[r][c] = 'S';
        mark(board, r + 1, c);
        mark(board, r - 1, c);
        mark(board, r, c + 1);
        mark(board, r, c - 1);
    }

    static void captureRegions(char[][] board) {
        int rows = board.length;
        int cols = board[0].length;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (r == 0 || r == rows - 1 || c == 0 || c == cols - 1) mark(board, r, c);
            }
        }
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) board[r][c] = board[r][c] == 'S' ? 'O' : 'X';
        }
    }
`),
  277: main(`${DIJKSTRA}
    static int[] dijkstra(int n, int[][] edges, int src) {
        int[] dist = shortest(n, edges, src, 0);
        for (int i = 0; i < n; i++) {
            if (dist[i] == Integer.MAX_VALUE) dist[i] = -1;
        }
        return dist;
    }
`),
  278: main(`${DIJKSTRA}
    static int networkDelay(int[][] times, int n, int k) {
        int[] dist = shortest(n, times, k - 1, 1);
        int worst = 0;
        for (int d : dist) {
            if (d == Integer.MAX_VALUE) return -1;
            worst = Math.max(worst, d);
        }
        return worst;
    }
`),
  279: main(`    static int ladderLength(String begin, String end, String[] words) {
        Set<String> dict = new HashSet<>();
        for (String w : words) dict.add(w);
        if (!dict.contains(end)) return 0;
        Set<String> seen = new HashSet<>();
        seen.add(begin);
        Queue<String> q = new LinkedList<>();
        q.offer(begin);
        int length = 1;
        while (!q.isEmpty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                String word = q.poll();
                if (word.equals(end)) return length;
                for (int p = 0; p < word.length(); p++) {
                    for (char ch = 'a'; ch <= 'z'; ch++) {
                        String next = word.substring(0, p) + ch + word.substring(p + 1);
                        if (dict.contains(next) && !seen.contains(next)) {
                            seen.add(next);
                            q.offer(next);
                        }
                    }
                }
            }
            length++;
        }
        return 0;
    }
`),
  280: main(`${FIND}
    static int mstWeight(int n, int[][] edges) {
        Arrays.sort(edges, (x, y) -> x[2] - y[2]);
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int total = 0;
        for (int[] e : edges) {
            int a = find(parent, e[0]);
            int b = find(parent, e[1]);
            if (a != b) {
                parent[a] = b;
                total += e[2];
            }
        }
        return total;
    }
`),
};
