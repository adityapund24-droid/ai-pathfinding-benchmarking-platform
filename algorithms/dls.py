from .common import build_path, neighbours, path_cost


def dls(start, end, walls, rows, cols, diagonal=True):
    limit = rows + cols
    stack = [(start, limit, None)]
    seen = {start}
    parent = {start: None}
    visited = []
    while stack:
        cur, depth, par = stack.pop()
        if par is not None:
            parent[cur] = par
        visited.append(cur)
        if cur == end:
            p = build_path(parent, end)
            return visited, p, path_cost(p)
        if depth == 0:
            continue
        nbs = list(neighbours(cur, walls, rows, cols, diagonal))
        for nxt, _ in reversed(nbs):
            if nxt not in seen:
                seen.add(nxt)
                stack.append((nxt, depth - 1, cur))
    return visited, [], 0
