// C++ reference solutions for Practice: Graphs. Never shipped to students.
const file = (functions: string) => `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <queue>
#include <set>
#include <climits>
using namespace std;

${functions}
int main() {
    return 0;
}
`;
const FIND = `int findRoot(vector<int>& parent, int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}
`;
const DIJKSTRA = `vector<int> shortest(int n, vector<vector<int>>& edges, int src) {
    vector<vector<int>> to(n);
    vector<vector<int>> len(n);
    for (int i = 0; i < edges.size(); i++) {
        to[edges[i][0]].push_back(edges[i][1]);
        len[edges[i][0]].push_back(edges[i][2]);
    }
    vector<int> dist(n, INT_MAX);
    vector<bool> done(n, false);
    dist[src] = 0;
    for (int round = 0; round < n; round++) {
        int u = -1;
        for (int i = 0; i < n; i++) {
            if (!done[i] && dist[i] != INT_MAX && (u == -1 || dist[i] < dist[u])) u = i;
        }
        if (u == -1) break;
        done[u] = true;
        for (int k = 0; k < to[u].size(); k++) {
            int v = to[u][k];
            if (dist[u] + len[u][k] < dist[v]) dist[v] = dist[u] + len[u][k];
        }
    }
    return dist;
}
`;
const ISLAND = `int sink(vector<vector<int>>& grid, int r, int c) {
    if (r < 0 || c < 0 || r >= grid.size() || c >= grid[0].size() || grid[r][c] != 1) return 0;
    grid[r][c] = 0;
    return 1 + sink(grid, r + 1, c) + sink(grid, r - 1, c) + sink(grid, r, c + 1) + sink(grid, r, c - 1);
}
`;
const KAHN = `vector<int> order(int n, vector<vector<int>>& pre) {
    vector<vector<int>> after(n);
    vector<int> waits(n, 0);
    for (int i = 0; i < pre.size(); i++) {
        after[pre[i][1]].push_back(pre[i][0]);
        waits[pre[i][0]]++;
    }
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (waits[i] == 0) q.push(i);
    }
    vector<int> out;
    while (!q.empty()) {
        int c = q.front();
        q.pop();
        out.push_back(c);
        for (int next : after[c]) {
            waits[next]--;
            if (waits[next] == 0) q.push(next);
        }
    }
    return out;
}
`;
const FLOW = `void spread(vector<vector<int>>& h, vector<vector<int>>& seen, int r, int c) {
    seen[r][c] = 1;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    for (int k = 0; k < 4; k++) {
        int nr = r + dr[k];
        int nc = c + dc[k];
        if (nr < 0 || nc < 0 || nr >= h.size() || nc >= h[0].size()) continue;
        if (seen[nr][nc] || h[nr][nc] < h[r][c]) continue;
        spread(h, seen, nr, nc);
    }
}
`;

const GRAPH_NODE = `struct Node {
    int val;
    vector<Node*> neighbors;
    Node(int x) : val(x) {}
};
`;

export const SOLUTIONS: Record<number, string> = {
  266: file(`${GRAPH_NODE}
Node* copyOf(Node* n, vector<Node*>& copies) {
    if (copies[n->val] != nullptr) return copies[n->val];
    Node* c = new Node(n->val);
    copies[n->val] = c;
    for (Node* m : n->neighbors) c->neighbors.push_back(copyOf(m, copies));
    return c;
}

Node* cloneGraph(Node* node) {
    if (node == nullptr) return nullptr;
    vector<Node*> copies(101, nullptr);
    return copyOf(node, copies);
}
`),
  261: file(`vector<vector<int>> toAdjList(int n, vector<vector<int>> edges) {
    vector<vector<int>> adj(n);
    for (int i = 0; i < edges.size(); i++) {
        adj[edges[i][0]].push_back(edges[i][1]);
        adj[edges[i][1]].push_back(edges[i][0]);
    }
    for (int i = 0; i < n; i++) sort(adj[i].begin(), adj[i].end());
    return adj;
}

vector<vector<int>> toAdjMatrix(int n, vector<vector<int>> edges) {
    vector<vector<int>> m(n, vector<int>(n, 0));
    for (int i = 0; i < edges.size(); i++) {
        m[edges[i][0]][edges[i][1]] = 1;
        m[edges[i][1]][edges[i][0]] = 1;
    }
    return m;
}
`),
  262: file(`vector<int> bfs(vector<vector<int>>& adj, int start) {
    vector<bool> seen(adj.size(), false);
    vector<int> out;
    queue<int> q;
    q.push(start);
    seen[start] = true;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        out.push_back(u);
        for (int v : adj[u]) {
            if (!seen[v]) {
                seen[v] = true;
                q.push(v);
            }
        }
    }
    return out;
}
`),
  263: file(`void visit(vector<vector<int>>& adj, int u, vector<bool>& seen, vector<int>& out) {
    seen[u] = true;
    out.push_back(u);
    for (int v : adj[u]) {
        if (!seen[v]) visit(adj, v, seen, out);
    }
}

vector<int> dfs(vector<vector<int>>& adj, int start) {
    vector<bool> seen(adj.size(), false);
    vector<int> out;
    visit(adj, start, seen, out);
    return out;
}
`),
  264: file(`${ISLAND}
int numIslands(vector<vector<int>> grid) {
    int count = 0;
    for (int r = 0; r < grid.size(); r++) {
        for (int c = 0; c < grid[0].size(); c++) {
            if (grid[r][c] == 1) {
                sink(grid, r, c);
                count++;
            }
        }
    }
    return count;
}
`),
  265: file(`${ISLAND}
int maxAreaIsland(vector<vector<int>> grid) {
    int best = 0;
    for (int r = 0; r < grid.size(); r++) {
        for (int c = 0; c < grid[0].size(); c++) best = max(best, sink(grid, r, c));
    }
    return best;
}
`),
  267: file(`${FIND}
bool hasCycleUndirected(int n, vector<vector<int>>& edges) {
    vector<int> parent(n, 0);
    for (int i = 0; i < n; i++) parent[i] = i;
    for (int i = 0; i < edges.size(); i++) {
        int a = findRoot(parent, edges[i][0]);
        int b = findRoot(parent, edges[i][1]);
        if (a == b) return true;
        parent[a] = b;
    }
    return false;
}
`),
  268: file(`bool loops(vector<vector<int>>& out, int u, vector<int>& state) {
    state[u] = 1;
    for (int v : out[u]) {
        if (state[v] == 1) return true;
        if (state[v] == 0 && loops(out, v, state)) return true;
    }
    state[u] = 2;
    return false;
}

bool hasCycleDirected(int n, vector<vector<int>>& edges) {
    vector<vector<int>> out(n);
    for (int i = 0; i < edges.size(); i++) out[edges[i][0]].push_back(edges[i][1]);
    vector<int> state(n, 0);
    for (int u = 0; u < n; u++) {
        if (state[u] == 0 && loops(out, u, state)) return true;
    }
    return false;
}
`),
  269: file(`${KAHN}
bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    return order(numCourses, prerequisites).size() == numCourses;
}
`),
  270: file(`${KAHN}
vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
    vector<int> out = order(numCourses, prerequisites);
    if (out.size() != numCourses) {
        vector<int> none;
        return none;
    }
    return out;
}
`),
  271: file(`int orangesRotting(vector<vector<int>> grid) {
    int rows = grid.size();
    int cols = grid[0].size();
    vector<int> qr;
    vector<int> qc;
    int fresh = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) {
                qr.push_back(r);
                qc.push_back(c);
            } else if (grid[r][c] == 1) {
                fresh++;
            }
        }
    }
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    int minutes = 0;
    int head = 0;
    while (fresh > 0 && head < qr.size()) {
        int size = qr.size();
        for (; head < size; head++) {
            for (int k = 0; k < 4; k++) {
                int nr = qr[head] + dr[k];
                int nc = qc[head] + dc[k];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                fresh--;
                qr.push_back(nr);
                qc.push_back(nc);
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}
`),
  272: file(`int shortestPathGrid(vector<vector<int>>& grid, vector<int> start, vector<int> end) {
    int rows = grid.size();
    int cols = grid[0].size();
    if (grid[start[0]][start[1]] == 1 || grid[end[0]][end[1]] == 1) return -1;
    vector<vector<int>> dist(rows, vector<int>(cols, -1));
    vector<int> qr;
    vector<int> qc;
    qr.push_back(start[0]);
    qc.push_back(start[1]);
    dist[start[0]][start[1]] = 0;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    for (int head = 0; head < qr.size(); head++) {
        int r = qr[head];
        int c = qc[head];
        if (r == end[0] && c == end[1]) return dist[r][c];
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k];
            int nc = c + dc[k];
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] == 1 || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            qr.push_back(nr);
            qc.push_back(nc);
        }
    }
    return -1;
}
`),
  273: file(`${FIND}
int countComponents(int n, vector<vector<int>>& edges) {
    vector<int> parent(n, 0);
    for (int i = 0; i < n; i++) parent[i] = i;
    int groups = n;
    for (int i = 0; i < edges.size(); i++) {
        int a = findRoot(parent, edges[i][0]);
        int b = findRoot(parent, edges[i][1]);
        if (a != b) {
            parent[a] = b;
            groups--;
        }
    }
    return groups;
}
`),
  274: file(`bool isBipartite(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> colour(n, -1);
    for (int s = 0; s < n; s++) {
        if (colour[s] != -1) continue;
        colour[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : graph[u]) {
                if (colour[v] == -1) {
                    colour[v] = 1 - colour[u];
                    q.push(v);
                } else if (colour[v] == colour[u]) {
                    return false;
                }
            }
        }
    }
    return true;
}
`),
  275: file(`${FLOW}
vector<vector<int>> flowBothEdges(vector<vector<int>>& heights) {
    vector<vector<int>> out;
    if (heights.empty()) return out;
    int rows = heights.size();
    int cols = heights[0].size();
    vector<vector<int>> a(rows, vector<int>(cols, 0));
    vector<vector<int>> b(rows, vector<int>(cols, 0));
    for (int r = 0; r < rows; r++) {
        if (!a[r][0]) spread(heights, a, r, 0);
        if (!b[r][cols - 1]) spread(heights, b, r, cols - 1);
    }
    for (int c = 0; c < cols; c++) {
        if (!a[0][c]) spread(heights, a, 0, c);
        if (!b[rows - 1][c]) spread(heights, b, rows - 1, c);
    }
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (a[r][c] && b[r][c]) {
                vector<int> cell;
                cell.push_back(r);
                cell.push_back(c);
                out.push_back(cell);
            }
        }
    }
    return out;
}
`),
  276: file(`void mark(vector<vector<char>>& board, int r, int c) {
    if (r < 0 || c < 0 || r >= board.size() || c >= board[0].size() || board[r][c] != 'O') return;
    board[r][c] = 'S';
    mark(board, r + 1, c);
    mark(board, r - 1, c);
    mark(board, r, c + 1);
    mark(board, r, c - 1);
}

void captureRegions(vector<vector<char>>& board) {
    if (board.empty()) return;
    int rows = board.size();
    int cols = board[0].size();
    for (int r = 0; r < rows; r++) {
        mark(board, r, 0);
        mark(board, r, cols - 1);
    }
    for (int c = 0; c < cols; c++) {
        mark(board, 0, c);
        mark(board, rows - 1, c);
    }
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (board[r][c] == 'O') board[r][c] = 'X';
            else if (board[r][c] == 'S') board[r][c] = 'O';
        }
    }
}
`),
  277: file(`${DIJKSTRA}
vector<int> dijkstra(int n, vector<vector<int>>& edges, int src) {
    vector<int> dist = shortest(n, edges, src);
    for (int i = 0; i < n; i++) {
        if (dist[i] == INT_MAX) dist[i] = -1;
    }
    return dist;
}
`),
  278: file(`${DIJKSTRA}
int networkDelay(vector<vector<int>>& times, int n, int k) {
    vector<vector<int>> edges;
    for (int i = 0; i < times.size(); i++) {
        vector<int> e;
        e.push_back(times[i][0] - 1);
        e.push_back(times[i][1] - 1);
        e.push_back(times[i][2]);
        edges.push_back(e);
    }
    vector<int> dist = shortest(n, edges, k - 1);
    int best = 0;
    for (int d : dist) {
        if (d == INT_MAX) return -1;
        best = max(best, d);
    }
    return best;
}
`),
  279: file(`int ladderLength(string begin, string end, vector<string> words) {
    set<string> dict;
    for (string w : words) dict.insert(w);
    if (!dict.count(end)) return 0;
    queue<string> q;
    queue<int> steps;
    q.push(begin);
    steps.push(1);
    set<string> seen;
    seen.insert(begin);
    while (!q.empty()) {
        string w = q.front();
        q.pop();
        int s = steps.front();
        steps.pop();
        if (w == end) return s;
        for (int i = 0; i < w.size(); i++) {
            for (char ch = 'a'; ch <= 'z'; ch++) {
                string next = w;
                next[i] = ch;
                if (dict.count(next) && !seen.count(next)) {
                    seen.insert(next);
                    q.push(next);
                    steps.push(s + 1);
                }
            }
        }
    }
    return 0;
}
`),
  280: file(`${FIND}
int mstWeight(int n, vector<vector<int>> edges) {
    sort(edges.begin(), edges.end(), [](vector<int> x, vector<int> y) { return x[2] < y[2]; });
    vector<int> parent(n, 0);
    for (int i = 0; i < n; i++) parent[i] = i;
    int total = 0;
    int used = 0;
    for (int i = 0; i < edges.size() && used < n - 1; i++) {
        int a = findRoot(parent, edges[i][0]);
        int b = findRoot(parent, edges[i][1]);
        if (a == b) continue;
        parent[a] = b;
        total += edges[i][2];
        used++;
    }
    return total;
}
`),
};
