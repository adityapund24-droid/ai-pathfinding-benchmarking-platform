PathFinder AI with Python Backend

What changed:
- Frontend pages and animation are kept same: index.html, solo.html, dual.html, all.html.
- All algorithm execution now goes to Python Flask backend through /api/pathfind.
- Python backend supports BFS, DFS, DLS, IDDFS, Best-First Search, A*, and Bidirectional BFS.

How to run:
1. Open terminal in this folder:
   cd pathfinding_new

2. Install Flask:
   pip install -r requirements.txt

3. Start backend:
   python server.py

4. Open frontend using VS Code Live Server:
   Right click index.html -> Open with Live Server

Important:
- Keep server.py running while using the project.
- Do not open HTML directly as file:/// if browser blocks fetch. Use Live Server.
- Backend URL is set in js/core.js:
  http://127.0.0.1:5000/api/pathfind
