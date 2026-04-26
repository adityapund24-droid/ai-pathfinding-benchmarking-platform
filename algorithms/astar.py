import heapq
import itertools

from .common import build_path, heuristic, neighbours, path_cost


def astar(start, end, walls, rows, cols, diagonal=True):
    counter = itertools.count()
    g_score = {start: 0}
    parent = {start: None}
    heap = [(heuristic(start, end, diagonal), next(counter), start)]
    closed = set()
    visited = []
    while heap:
        _, _, cur = heapq.heappop(heap)
        if cur in closed:
            continue
        closed.add(cur)
        visited.append(cur)
        if cur == end:
            p = build_path(parent, end)
            return visited, p, path_cost(p)
        for nxt, step_cost in neighbours(cur, walls, rows, cols, diagonal):
            if nxt in closed:
                continue
            new_g = g_score[cur] + step_cost
            if new_g < g_score.get(nxt, float("inf")):
                g_score[nxt] = new_g
                parent[nxt] = cur
                f = new_g + heuristic(nxt, end, diagonal)
                heapq.heappush(heap, (f, next(counter), nxt))
    return visited, [], 0
