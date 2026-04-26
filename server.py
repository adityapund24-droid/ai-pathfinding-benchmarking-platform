from flask import Flask, request, jsonify
import time

from algorithms import ALGORITHMS

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

@app.route("/api/pathfind", methods=["OPTIONS"])
def options_pathfind():
    return "", 204

@app.route("/api/pathfind", methods=["POST"])
def pathfind():
    data = request.get_json(force=True)
    algo = data.get("algorithm")
    if algo not in ALGORITHMS:
        return jsonify({"error": "Unknown algorithm"}), 400

    rows = int(data["rows"])
    cols = int(data["cols"])
    start = tuple(data["start"])
    end = tuple(data["end"])
    diagonal = False
    walls = {tuple(x) for x in data.get("walls", [])}

    t0 = time.perf_counter()
    visited, path, cost = ALGORITHMS[algo](start, end, walls, rows, cols, diagonal)
    elapsed = (time.perf_counter() - t0) * 1000

    return jsonify({
        "algorithm": algo,
        "visited": [[r, c] for r, c in visited],
        "path": [[r, c] for r, c in path],
        "pathCost": cost,
        "time_ms": elapsed,
    })

@app.route("/")
def home():
    return "PathFinder Python backend is running. Open index.html with Live Server and run algorithms."

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
