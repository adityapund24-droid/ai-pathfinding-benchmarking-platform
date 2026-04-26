from .astar import astar
from .best_first import best_first
from .bfs import bfs
from .bidirectional import bidirectional
from .dfs import dfs
from .dls import dls
from .iddfs import iddfs


ALGORITHMS = {
    "bfs": bfs,
    "dfs": dfs,
    "dls": dls,
    "iddfs": iddfs,
    "bestfs": best_first,
    "astar": astar,
    "bidir": bidirectional,
}
