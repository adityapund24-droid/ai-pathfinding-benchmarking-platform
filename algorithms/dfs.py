from .common import build_path, neighbours, path_cost


def dfs(start, end, walls, rows, cols, diagonal=True):
    stack = [start]
    parent = {start: None}
    visited = []
    while stack:
        cur = stack.pop()
        visited.append(cur)
        if cur == end:
            p = build_path(parent, end)
            return visited, p, path_cost(p)
        for nxt, _ in neighbours(cur, walls, rows, cols, diagonal):
            if nxt not in parent:
                parent[nxt] = cur
                stack.append(nxt)
    return visited, [], 0
