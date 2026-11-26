// JavaScript reference solutions for Practice: Graphs. Never shipped to students.
const UNION_FIND = `function makeFind(n) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  return { parent, find };
}
`;
const GRID_SEARCH = `function islandSizes(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = new Set();
  const sizes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || seen.has(r * cols + c)) continue;
      let size = 0;
      const stack = [[r, c]];
      seen.add(r * cols + c);
      while (stack.length) {
        const [a, b] = stack.pop();
        size++;
        for (const [x, y] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) {
          if (x >= 0 && x < rows && y >= 0 && y < cols && grid[x][y] === 1 && !seen.has(x * cols + y)) {
            seen.add(x * cols + y);
            stack.push([x, y]);
          }
        }
      }
      sizes.push(size);
    }
  }
  return sizes;
}
`;
const ORDER = `function courseOrder(numCourses, prerequisites) {
  const waits = new Array(numCourses).fill(0);
  const neededBy = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) {
    waits[a]++;
    neededBy[b].push(a);
  }
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (waits[c] === 0) queue.push(c);
  const order = [];
  while (queue.length) {
    const c = queue.shift();
    order.push(c);
    for (const d of neededBy[c]) if (--waits[d] === 0) queue.push(d);
  }
  return order;
}
`;
const DIJKSTRA = `function shortest(n, adj, src) {
  const dist = new Array(n).fill(Infinity);
  const done = new Array(n).fill(false);
  dist[src] = 0;
  for (let round = 0; round < n; round++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!done[v] && dist[v] < Infinity && (u === -1 || dist[v] < dist[u])) u = v;
    if (u === -1) break;
    done[u] = true;
    for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
  }
  return dist;
}
`;

export const SOLUTIONS: Record<number, string> = {
  261: `function toAdjList(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  return adj.map((list) => list.sort((x, y) => x - y));
}

function toAdjMatrix(n, edges) {
  const m = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [a, b] of edges) {
    m[a][b] = 1;
    m[b][a] = 1;
  }
  return m;
}
`,
  262: `function bfs(adj, start) {
  const seen = new Set([start]);
  const order = [];
  const queue = [start];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const nb of adj[node]) {
      if (!seen.has(nb)) {
        seen.add(nb);
        queue.push(nb);
      }
    }
  }
  return order;
}
`,
  263: `function dfs(adj, start) {
  const seen = new Set();
  const order = [];
  const visit = (node) => {
    seen.add(node);
    order.push(node);
    for (const nb of adj[node]) if (!seen.has(nb)) visit(nb);
  };
  visit(start);
  return order;
}
`,
  264: `${GRID_SEARCH}
function numIslands(grid) {
  return islandSizes(grid).length;
}
`,
  265: `${GRID_SEARCH}
function maxAreaIsland(grid) {
  return Math.max(0, ...islandSizes(grid));
}
`,
  266: `class Node {
  constructor(val = 0, neighbors = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node) {
  if (!node) return null;
  const copies = new Map();
  const copy = (n) => {
    if (copies.has(n)) return copies.get(n);
    const c = new Node(n.val);
    copies.set(n, c);
    c.neighbors = n.neighbors.map(copy);
    return c;
  };
  return copy(node);
}
`,
  267: `${UNION_FIND}
function hasCycleUndirected(n, edges) {
  const { parent, find } = makeFind(n);
  for (const [a, b] of edges) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return true;
    parent[ra] = rb;
  }
  return false;
}
`,
  268: `function hasCycleDirected(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) adj[a].push(b);
  const state = new Array(n).fill(0); // 0 not visited, 1 on the path, 2 finished
  const visit = (u) => {
    state[u] = 1;
    for (const v of adj[u]) {
      if (state[v] === 1) return true;
      if (state[v] === 0 && visit(v)) return true;
    }
    state[u] = 2;
    return false;
  };
  for (let u = 0; u < n; u++) if (state[u] === 0 && visit(u)) return true;
  return false;
}
`,
  269: `${ORDER}
function canFinish(numCourses, prerequisites) {
  return courseOrder(numCourses, prerequisites).length === numCourses;
}
`,
  270: `${ORDER}
function findOrder(numCourses, prerequisites) {
  const order = courseOrder(numCourses, prerequisites);
  return order.length === numCourses ? order : [];
}
`,
  271: `function orangesRotting(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let rotten = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) rotten.push([r, c]);
      if (grid[r][c] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (rotten.length && fresh) {
    const next = [];
    for (const [a, b] of rotten) {
      for (const [x, y] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) {
        if (x >= 0 && x < rows && y >= 0 && y < cols && grid[x][y] === 1) {
          grid[x][y] = 2;
          fresh--;
          next.push([x, y]);
        }
      }
    }
    rotten = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}
`,
  272: `function shortestPathGrid(grid, start, end) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (grid[start[0]][start[1]] === 1) return -1;
  const seen = new Set([start[0] * cols + start[1]]);
  const queue = [[start[0], start[1], 0]];
  while (queue.length) {
    const [a, b, d] = queue.shift();
    if (a === end[0] && b === end[1]) return d;
    for (const [x, y] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) {
      if (x >= 0 && x < rows && y >= 0 && y < cols && grid[x][y] === 0 && !seen.has(x * cols + y)) {
        seen.add(x * cols + y);
        queue.push([x, y, d + 1]);
      }
    }
  }
  return -1;
}
`,
  273: `${UNION_FIND}
function countComponents(n, edges) {
  const { parent, find } = makeFind(n);
  let groups = n;
  for (const [a, b] of edges) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
      groups--;
    }
  }
  return groups;
}
`,
  274: `function isBipartite(graph) {
  const colour = new Map();
  for (let s = 0; s < graph.length; s++) {
    if (colour.has(s)) continue;
    colour.set(s, 0);
    const stack = [s];
    while (stack.length) {
      const u = stack.pop();
      for (const v of graph[u]) {
        if (!colour.has(v)) {
          colour.set(v, 1 - colour.get(u));
          stack.push(v);
        } else if (colour.get(v) === colour.get(u)) return false;
      }
    }
  }
  return true;
}
`,
  275: `function flowBothEdges(heights) {
  const rows = heights.length;
  const cols = heights[0].length;
  const reach = (starts) => {
    const seen = new Set(starts.map(([r, c]) => r * cols + c));
    const stack = [...starts];
    while (stack.length) {
      const [a, b] = stack.pop();
      for (const [x, y] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) {
        if (x >= 0 && x < rows && y >= 0 && y < cols && !seen.has(x * cols + y) && heights[x][y] >= heights[a][b]) {
          seen.add(x * cols + y);
          stack.push([x, y]);
        }
      }
    }
    return seen;
  };
  const tl = [];
  const br = [];
  for (let c = 0; c < cols; c++) {
    tl.push([0, c]);
    br.push([rows - 1, c]);
  }
  for (let r = 0; r < rows; r++) {
    tl.push([r, 0]);
    br.push([r, cols - 1]);
  }
  const a = reach(tl);
  const b = reach(br);
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (a.has(r * cols + c) && b.has(r * cols + c)) out.push([r, c]);
  return out;
}
`,
  276: `function captureRegions(board) {
  const rows = board.length;
  const cols = board[0].length;
  const stack = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === 0 || r === rows - 1 || c === 0 || c === cols - 1) && board[r][c] === "O") {
        board[r][c] = "S";
        stack.push([r, c]);
      }
    }
  }
  while (stack.length) {
    const [a, b] = stack.pop();
    for (const [x, y] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) {
      if (x >= 0 && x < rows && y >= 0 && y < cols && board[x][y] === "O") {
        board[x][y] = "S";
        stack.push([x, y]);
      }
    }
  }
  for (const row of board) for (let c = 0; c < cols; c++) row[c] = row[c] === "S" ? "O" : "X";
}
`,
  277: `${DIJKSTRA}
function dijkstra(n, edges, src) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b, w] of edges) adj[a].push([b, w]);
  return shortest(n, adj, src).map((d) => (d === Infinity ? -1 : d));
}
`,
  278: `${DIJKSTRA}
function networkDelay(times, n, k) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of times) adj[u - 1].push([v - 1, w]);
  const dist = shortest(n, adj, k - 1);
  const worst = Math.max(...dist);
  return worst === Infinity ? -1 : worst;
}
`,
  279: `function ladderLength(begin, end, words) {
  const dict = new Set(words);
  if (!dict.has(end)) return 0;
  const seen = new Set([begin]);
  const queue = [[begin, 1]];
  while (queue.length) {
    const [word, length] = queue.shift();
    if (word === end) return length;
    for (let i = 0; i < word.length; i++) {
      for (const ch of "abcdefghijklmnopqrstuvwxyz") {
        const next = word.slice(0, i) + ch + word.slice(i + 1);
        if (dict.has(next) && !seen.has(next)) {
          seen.add(next);
          queue.push([next, length + 1]);
        }
      }
    }
  }
  return 0;
}
`,
  280: `${UNION_FIND}
function mstWeight(n, edges) {
  const { parent, find } = makeFind(n);
  let total = 0;
  for (const [a, b, w] of edges.slice().sort((x, y) => x[2] - y[2])) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
      total += w;
    }
  }
  return total;
}
`,
};
