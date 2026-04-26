from collections import deque


def get_dirs(diagonal=True):
    dirs = [(0, 1, 1), (0, -1, 1), (1, 0, 1), (-1, 0, 1)]
    if diagonal:
        dirs += [(1, 1, 1.414), (1, -1, 1.414), (-1, 1, 1.414), (-1, -1, 1.414)]
    return dirs


def heuristic(a, b, diagonal=True):
    dr = abs(a[0] - b[0])
    dc = abs(a[1] - b[1])
    return max(dr, dc) if diagonal else dr + dc


def neighbours(cell, walls, rows, cols, diagonal=True):
    r, c = cell
    for dr, dc, cost in get_dirs(diagonal):
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in walls:
            yield (nr, nc), cost


def build_path(parent, end):
    if end not in parent:
        return []
    path = []
    cur = end
    while cur is not None:
        path.append(cur)
        cur = parent.get(cur)
    path.reverse()
    return path


def path_cost(path):
    if len(path) < 2:
        return 0
    total = 0
    for i in range(1, len(path)):
        dr = abs(path[i][0] - path[i - 1][0])
        dc = abs(path[i][1] - path[i - 1][1])
        total += 1.414 if dr == 1 and dc == 1 else 1
    return total
