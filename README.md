# AI Pathfinding Benchmarking Platform

Interactive pathfinding visualizer with a Python Flask backend and HTML/JavaScript frontend.

## Overview

This project lets you compare common pathfinding algorithms on a grid-based map with walls, a start node, and a goal node. The frontend handles visualization, while the backend runs the algorithms and returns the visited nodes, final path, path cost, and execution time.

## Features

- Grid-based pathfinding visualization
- Backend-powered algorithm execution through Flask
- Support for multiple algorithms:
	- BFS
	- DFS
	- DLS
	- IDDFS
	- Best-First Search
	- A*
	- Bidirectional BFS
- Wall placement and start/end node selection
- Results for visited nodes, path, cost, and runtime
- Separate views for solo, dual, and all-algorithm comparison

## Project Structure

- `index.html` - main landing page
- `solo.html` - single-algorithm view
- `dual.html` - two-algorithm comparison view
- `all.html` - all-algorithm comparison view
- `js/core.js` - frontend logic and API calls
- `server.py` - Flask backend
- `algorithms/` - algorithm implementations
- `requirements.txt` - Python dependency list

## Requirements

- Python 3.13 or compatible Python 3 version
- Flask 3.0.3
- A browser
- VS Code Live Server, or another local web server for the frontend

## Installation

1. Open a terminal in the `pathfinding_new` folder.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Project

1. Start the backend:

```bash
python server.py
```

2. Open the frontend with VS Code Live Server.
3. Visit `index.html` and use the UI to run algorithms.

Important: do not open the HTML files directly with `file:///` if the browser blocks API requests. Use Live Server instead.

## Backend API

The frontend sends requests to:

```text
http://127.0.0.1:5000/api/pathfind
```

### Request Body

```json
{
	"algorithm": "bfs",
	"rows": 20,
	"cols": 20,
	"start": [0, 0],
	"end": [19, 19],
	"walls": [[1, 1], [1, 2]]
}
```

### Response Body

```json
{
	"algorithm": "bfs",
	"visited": [[0, 0], [0, 1]],
	"path": [[0, 0], [0, 1], [1, 1]],
	"pathCost": 3,
	"time_ms": 1.23
}
```

## Notes

- The backend includes CORS headers so the frontend can call it locally.
- Keep `server.py` running while you use the visualizer.
- If you change algorithm code, restart the backend to load the updates.

This project help to analyze the ai algorithms