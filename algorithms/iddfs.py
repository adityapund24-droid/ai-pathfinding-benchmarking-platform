from .common import build_path, neighbours, path_cost


def iddfs(start, end, walls, rows, cols, diagonal=True):
    all_visited = []
    max_limit = (rows + cols) * 2
    for limit in range(max_limit + 1):
        stack = [(start, limit, None)]
        seen = {start}
        parent = {start: None}
        found = False
        while stack:
            cur, depth, par = stack.pop()
            if par is not None:
                parent[cur] = par
            all_visited.append(cur)
            if cur == end:
                found = True
                break
            if depth == 0:
                continue
            nbs = list(neighbours(cur, walls, rows, cols, diagonal))
            for nxt, _ in reversed(nbs):
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append((nxt, depth - 1, cur))
        if found:
            p = build_path(parent, end)
            return all_visited, p, path_cost(p)
    return all_visited, [], 0
