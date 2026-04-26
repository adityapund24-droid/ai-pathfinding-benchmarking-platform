import heapq
import itertools

from .common import build_path, heuristic, neighbours, path_cost


def best_first(start, end, walls, rows, cols, diagonal=True):
    counter = itertools.count()
    heap = [(heuristic(start, end, diagonal), next(counter), start)]
    parent = {start: None}
    visited = []
    while heap:
        _, _, cur = heapq.heappop(heap)
        visited.append(cur)
        if cur == end:
            p = build_path(parent, end)
            return visited, p, path_cost(p)
        for nxt, _ in neighbours(cur, walls, rows, cols, diagonal):
            if nxt not in parent:
                parent[nxt] = cur
                heapq.heappush(heap, (heuristic(nxt, end, diagonal), next(counter), nxt))
    return visited, [], 0
