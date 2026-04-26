from collections import deque

from .common import neighbours, path_cost


def bidirectional(start, end, walls, rows, cols, diagonal=True):
    qf, qb = deque([start]), deque([end])
    pf, pb = {start: None}, {end: None}
    visited = []
    meet = None
    while qf or qb:
        if qf:
            cur = qf.popleft()
            visited.append(cur)
            if cur in pb:
                meet = cur
                break
            for nxt, _ in neighbours(cur, walls, rows, cols, diagonal):
                if nxt not in pf:
                    pf[nxt] = cur
                    qf.append(nxt)
        if qb:
            cur = qb.popleft()
            visited.append(cur)
            if cur in pf:
                meet = cur
                break
            for nxt, _ in neighbours(cur, walls, rows, cols, diagonal):
                if nxt not in pb:
                    pb[nxt] = cur
                    qb.append(nxt)
    if meet is None:
        return visited, [], 0
    left = []
    cur = meet
    while cur is not None:
        left.append(cur)
        cur = pf[cur]
    left.reverse()
    right = []
    cur = pb.get(meet)
    while cur is not None:
        right.append(cur)
        cur = pb[cur]
    p = left + right
    return visited, p, path_cost(p)
