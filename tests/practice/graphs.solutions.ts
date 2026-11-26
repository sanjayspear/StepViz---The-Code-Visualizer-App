// Reference solutions for Practice: Graphs (Python). Never shipped to students.
export const SOLUTIONS: Record<number, string> = {
  261: `def to_adj_list(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    return [sorted(x) for x in adj]


def to_adj_matrix(n, edges):
    m = [[0] * n for _ in range(n)]
    for a, b in edges:
        m[a][b] = 1
        m[b][a] = 1
    return m
`,
  262: `from collections import deque


def bfs(adj, start):
    seen = {start}
    order = []
    q = deque([start])
    while q:
        node = q.popleft()
        order.append(node)
        for nb in adj[node]:
            if nb not in seen:
                seen.add(nb)
                q.append(nb)
    return order
`,
  263: `def dfs(adj, start):
    seen = set()
    order = []
    def visit(node):
        seen.add(node)
        order.append(node)
        for nb in adj[node]:
            if nb not in seen:
                visit(nb)
    visit(start)
    return order
`,
  264: `def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r, c) not in seen:
                count += 1
                stack = [(r, c)]
                seen.add((r, c))
                while stack:
                    a, b = stack.pop()
                    for x, y in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                        if 0 <= x < rows and 0 <= y < cols and grid[x][y] == 1 and (x, y) not in seen:
                            seen.add((x, y))
                            stack.append((x, y))
    return count
`,
  265: `def max_area_island(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r, c) not in seen:
                size = 0
                stack = [(r, c)]
                seen.add((r, c))
                while stack:
                    a, b = stack.pop()
                    size += 1
                    for x, y in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                        if 0 <= x < rows and 0 <= y < cols and grid[x][y] == 1 and (x, y) not in seen:
                            seen.add((x, y))
                            stack.append((x, y))
                best = max(best, size)
    return best
`,
  266: `class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


def clone_graph(node):
    if node is None:
        return None
    copies = {}
    def copy(n):
        if n in copies:
            return copies[n]
        c = Node(n.val)
        copies[n] = c
        c.neighbors = [copy(m) for m in n.neighbors]
        return c
    return copy(node)
`,
  267: `def has_cycle_undirected(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return True
        parent[ra] = rb
    return False
`,
  268: `def has_cycle_directed(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
    state = [0] * n  # 0 not visited, 1 on the path, 2 finished
    def visit(u):
        state[u] = 1
        for v in adj[u]:
            if state[v] == 1:
                return True
            if state[v] == 0 and visit(v):
                return True
        state[u] = 2
        return False
    return any(state[u] == 0 and visit(u) for u in range(n))
`,
  269: `from collections import deque


def can_finish(num_courses, prerequisites):
    waits = [0] * num_courses
    needed_by = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        waits[a] += 1
        needed_by[b].append(a)
    q = deque(c for c in range(num_courses) if waits[c] == 0)
    taken = 0
    while q:
        c = q.popleft()
        taken += 1
        for d in needed_by[c]:
            waits[d] -= 1
            if waits[d] == 0:
                q.append(d)
    return taken == num_courses
`,
  270: `from collections import deque


def find_order(num_courses, prerequisites):
    waits = [0] * num_courses
    needed_by = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        waits[a] += 1
        needed_by[b].append(a)
    q = deque(c for c in range(num_courses) if waits[c] == 0)
    order = []
    while q:
        c = q.popleft()
        order.append(c)
        for d in needed_by[c]:
            waits[d] -= 1
            if waits[d] == 0:
                q.append(d)
    return order if len(order) == num_courses else []
`,
  271: `def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    rotten = [(r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 2]
    fresh = sum(row.count(1) for row in grid)
    minutes = 0
    while rotten and fresh:
        nxt = []
        for a, b in rotten:
            for x, y in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                if 0 <= x < rows and 0 <= y < cols and grid[x][y] == 1:
                    grid[x][y] = 2
                    fresh -= 1
                    nxt.append((x, y))
        rotten = nxt
        minutes += 1
    return minutes if fresh == 0 else -1
`,
  272: `from collections import deque


def shortest_path_grid(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    start, end = tuple(start), tuple(end)
    if grid[start[0]][start[1]] == 1:
        return -1
    q = deque([(start, 0)])
    seen = {start}
    while q:
        (a, b), d = q.popleft()
        if (a, b) == end:
            return d
        for x, y in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
            if 0 <= x < rows and 0 <= y < cols and grid[x][y] == 0 and (x, y) not in seen:
                seen.add((x, y))
                q.append(((x, y), d + 1))
    return -1
`,
  273: `def count_components(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    groups = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            groups -= 1
    return groups
`,
  274: `def is_bipartite(graph):
    colour = {}
    for s in range(len(graph)):
        if s in colour:
            continue
        colour[s] = 0
        stack = [s]
        while stack:
            u = stack.pop()
            for v in graph[u]:
                if v not in colour:
                    colour[v] = 1 - colour[u]
                    stack.append(v)
                elif colour[v] == colour[u]:
                    return False
    return True
`,
  275: `def flow_both_edges(heights):
    rows, cols = len(heights), len(heights[0])
    def reach(starts):
        seen = set(starts)
        stack = list(starts)
        while stack:
            a, b = stack.pop()
            for x, y in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                if 0 <= x < rows and 0 <= y < cols and (x, y) not in seen and heights[x][y] >= heights[a][b]:
                    seen.add((x, y))
                    stack.append((x, y))
        return seen
    top_left = reach([(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)])
    bottom_right = reach([(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)])
    return [[r, c] for r in range(rows) for c in range(cols) if (r, c) in top_left and (r, c) in bottom_right]
`,
  276: `def capture_regions(board):
    rows, cols = len(board), len(board[0])
    stack = [(r, c) for r in range(rows) for c in range(cols) if (r in (0, rows - 1) or c in (0, cols - 1)) and board[r][c] == "O"]
    for r, c in stack:
        board[r][c] = "S"
    while stack:
        a, b = stack.pop()
        for x, y in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
            if 0 <= x < rows and 0 <= y < cols and board[x][y] == "O":
                board[x][y] = "S"
                stack.append((x, y))
    for r in range(rows):
        for c in range(cols):
            board[r][c] = "O" if board[r][c] == "S" else "X"
`,
  277: `import heapq


def dijkstra(n, edges, src):
    adj = [[] for _ in range(n)]
    for a, b, w in edges:
        adj[a].append((b, w))
    dist = [-1] * n
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if dist[u] != -1:
            continue
        dist[u] = d
        for v, w in adj[u]:
            if dist[v] == -1:
                heapq.heappush(heap, (d + w, v))
    return dist
`,
  278: `import heapq


def network_delay(times, n, k):
    adj = {u: [] for u in range(1, n + 1)}
    for u, v, w in times:
        adj[u].append((v, w))
    done = {}
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if u in done:
            continue
        done[u] = d
        for v, w in adj[u]:
            if v not in done:
                heapq.heappush(heap, (d + w, v))
    return max(done.values()) if len(done) == n else -1
`,
  279: `from collections import deque


def ladder_length(begin, end, words):
    words = set(words)
    if end not in words:
        return 0
    q = deque([(begin, 1)])
    seen = {begin}
    while q:
        word, length = q.popleft()
        if word == end:
            return length
        for i in range(len(word)):
            for ch in "abcdefghijklmnopqrstuvwxyz":
                nxt = word[:i] + ch + word[i + 1:]
                if nxt in words and nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, length + 1))
    return 0
`,
  280: `def mst_weight(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = 0
    for a, b, w in sorted(edges, key=lambda e: e[2]):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            total += w
    return total
`,
};
