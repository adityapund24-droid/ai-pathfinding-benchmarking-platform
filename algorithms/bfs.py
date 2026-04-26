from collections import deque

from .common import build_path, neighbours, path_cost


def bfs(start, end, walls, rows, cols, diagonal=True):
    q = deque([start])
    parent = {start: None}
    visited = []
    while q:
        cur = q.popleft()
        visited.append(cur)
        if cur == end:
            p = build_path(parent, end)
            return visited, p, path_cost(p)
        for nxt, _ in neighbours(cur, walls, rows, cols, diagonal):
            if nxt not in parent:
                parent[nxt] = cur
                q.append(nxt)
    return visited, [], 0
