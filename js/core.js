/* ── core.js ─── shared state, grid, renderer, all 7 algorithms ── */

/* ── CONFIG ── */
var COLS = 25, ROWS = 25, CELL = 20;
var grid = [], startCell = null, endCell = null;
var mouseDown = false;
var diagonalMove = false;

var COLORS = {
  bfs   :'#34d399', dfs:'#fb923c', dls:'#a78bfa', iddfs:'#00d4ff',
  bestfs:'#f472b6', astar:'#facc15', bidir:'#38bdf8'
};
var NAMES = {
  bfs:'BFS', dfs:'DFS', dls:'Depth-Limited', iddfs:'IDDFS',
  bestfs:'Best-First', astar:'A★ Search', bidir:'Bidirectional'
};

var DIRS = [];
function rebuildDirs() {
  DIRS = [[0,1,1],[0,-1,1],[1,0,1],[-1,0,1]];
  if (diagonalMove) {
    DIRS.push([1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]);
  }
}
rebuildDirs();

var INFO = {
  bfs:   {type:'Uninformed',opt:'✓ Yes',comp:'✓ Yes',time:'O(V+E)',space:'O(V)',
          desc:'Explores all nodes level by level (FIFO queue). Guaranteed shortest path on unweighted grids.'},
  dfs:   {type:'Uninformed',opt:'✗ No',comp:'✓ Yes',time:'O(V+E)',space:'O(V)',
          desc:'Dives as deep as possible before backtracking (LIFO stack). Finds a path but not the shortest.'},
  dls:   {type:'Uninformed',opt:'✗ No',comp:'✗ No',time:'O(b^l)',space:'O(l)',
          desc:'DFS capped at depth ROWS+COLS. Prevents infinite loops but may miss farther goals.'},
  iddfs: {type:'Uninformed',opt:'✓ Yes',comp:'✓ Yes',time:'O(b^d)',space:'O(d)',
          desc:'Repeats DLS with limits 0,1,2… until goal found. BFS-optimal with DFS memory use.'},
  bestfs:{type:'Informed',opt:'✗ No',comp:'✓ Yes',time:'O(b^m)',space:'O(b^m)',
          desc:'Greedy: always expands the node closest to goal by heuristic. Fast but not always optimal.'},
  astar: {type:'Informed',opt:'✓ Yes',comp:'✓ Yes',time:'O(b^d)',space:'O(b^d)',
          desc:'Combines actual cost g(n) and heuristic h(n). Optimal and complete with an admissible heuristic.'},
  bidir: {type:'Uninformed',opt:'✓ Yes',comp:'✓ Yes',time:'O(b^(d/2))',space:'O(b^(d/2))',
          desc:'Simultaneous BFS from start and goal. Meets in the middle — dramatically reduces search space.'}
};

/* ── GRID ── */
function makeCell(r,c){return{r,c,wall:false,visited:false,inPath:false,visitColor:null,pathColor:null,parent:null,g:0,f:0};}

function initGrid(canvasId) {
  var canvas = document.getElementById(canvasId);
  if(!canvas) return null;
  var wrap = canvas.parentElement;
  var W = wrap.offsetWidth || 600;
  var H = wrap.offsetHeight || 500;
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');

  CELL = Math.floor(Math.min(W/COLS, H/ROWS));
  if(CELL<4) CELL=4;
  COLS = Math.floor(W/CELL);
  ROWS = Math.floor(H/CELL);

  grid = [];
  for(var r=0;r<ROWS;r++){grid[r]=[];for(var c=0;c<COLS;c++)grid[r][c]=makeCell(r,c);}
  startCell = grid[Math.floor(ROWS/2)][2];
  endCell   = grid[Math.floor(ROWS/2)][COLS-3];
  return {canvas,ctx};
}

function initGridSplit(canvas, W, H) {
  /* For dual/all view — returns {canvas, ctx, grid, startCell, endCell} */
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');
  var cols = Math.floor(W / CELL);
  var rows = Math.floor(H / CELL);
  if(cols<4) cols=4; if(rows<4) rows=4;
  var g = [];
  for(var r=0;r<rows;r++){g[r]=[];for(var c=0;c<cols;c++)g[r][c]=makeCell(r,c);}
  var sc = g[Math.floor(rows/2)][2];
  var ec = g[Math.floor(rows/2)][cols-3];
  return {canvas,ctx,grid:g,startCell:sc,endCell:ec,ROWS:rows,COLS:cols};
}

function neighbours(cell, g, R, C) {
  g=g||grid; R=R||ROWS; C=C||COLS;
  var res=[];
  for(var i=0;i<DIRS.length;i++){
    var dr=DIRS[i][0],dc=DIRS[i][1],cost=DIRS[i][2];
    var nr=cell.r+dr,nc=cell.c+dc;
    if(nr>=0&&nr<R&&nc>=0&&nc<C&&!g[nr][nc].wall)
      res.push({cell:g[nr][nc],cost});
  }
  return res;
}

function clearCellState(cell){cell.visited=false;cell.inPath=false;cell.visitColor=null;cell.pathColor=null;cell.parent=null;cell.g=0;cell.f=0;}
function clearState(g){g=g||grid;for(var r=0;r<g.length;r++)for(var c=0;c<g[r].length;c++)clearCellState(g[r][c]);}
function clearWalls(g){g=g||grid;for(var r=0;r<g.length;r++)for(var c=0;c<g[r].length;c++){g[r][c].wall=false;clearCellState(g[r][c]);}}

/* ── RENDERER ── */
function drawAll(ctx, g, S, E, cell_sz) {
  cell_sz=cell_sz||CELL; g=g||grid;
  ctx.fillStyle='#070d1a';
  ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
  for(var r=0;r<g.length;r++)for(var c=0;c<g[r].length;c++)drawCell(ctx,g[r][c],S,E,cell_sz);
}

function drawCell(ctx, cell, S, E, cs) {
  cs=cs||CELL;
  var x=cell.c*cs,y=cell.r*cs,s=cs-1;
  if(cell===S){ctx.fillStyle='#003320';ctx.fillRect(x,y,s,s);cText(ctx,x,y,s,'▶','#00ff88');return;}
  if(cell===E){ctx.fillStyle='#300010';ctx.fillRect(x,y,s,s);cText(ctx,x,y,s,'●','#ff4757');return;}
  if(cell.wall){
    ctx.fillStyle='#1e3050';ctx.fillRect(x,y,s,s);
    ctx.strokeStyle='#2d4a7a';ctx.lineWidth=0.5;ctx.strokeRect(x+.5,y+.5,s-1,s-1);return;
  }
  if(cell.inPath&&cell.pathColor){
    ctx.shadowColor=cell.pathColor;ctx.shadowBlur=4;
    ctx.fillStyle=cell.pathColor;ctx.fillRect(x,y,s,s);ctx.shadowBlur=0;return;
  }
  if(cell.visited&&cell.visitColor){ctx.fillStyle=cell.visitColor;ctx.fillRect(x,y,s,s);return;}
  ctx.fillStyle='#070d1a';ctx.fillRect(x,y,s,s);
  ctx.strokeStyle='#0f1e33';ctx.lineWidth=0.5;ctx.strokeRect(x,y,s,s);
}

function cText(ctx,x,y,s,ch,col){
  ctx.fillStyle=col;
  ctx.font='bold '+Math.max(10,Math.floor(s*.55))+'px JetBrains Mono';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(ch,x+s/2,y+s/2);
}

function hexRgba(h,a){
  var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return'rgba('+r+','+g+','+b+','+a+')';
}

/* ── FRONTEND HELPERS ONLY ──
   IMPORTANT: No pathfinding algorithm runs in JavaScript now.
   JavaScript only draws the grid, creates walls, animates returned cells,
   and calls the Python Flask backend at /api/pathfind.
*/
function calcPathCost(path){
  if(!path||path.length<2)return 0;
  var cost=0;
  for(var i=1;i<path.length;i++){
    var dr=Math.abs(path[i].r-path[i-1].r),dc=Math.abs(path[i].c-path[i-1].c);
    cost+=(dr===1&&dc===1)?1.414:1;
  }
  return cost;
}

function heuristic(a,b){
  var dr=Math.abs(a.r-b.r),dc=Math.abs(a.c-b.c);
  return dr+dc;
}

/* ── MAZE GENERATORS ── */
function genMaze(type,g,R,C,S,E){
  g=g||grid;R=R||ROWS;C=C||COLS;S=S||startCell;E=E||endCell;
  for(var r=0;r<R;r++)for(var c=0;c<C;c++){
    g[r][c].wall=false;clearCellState(g[r][c]);
  }
  if(type==='random')mRandom(g,R,C,S,E);
  else if(type==='spiral')mSpiral(g,R,C,S,E);
  else if(type==='chambers')mChambers(g,R,C,S,E);
  else if(type==='recursive')mRecursive(g,R,C,S,E);
  else if(type==='corridor')mCorridor(g,R,C,S,E);
  else if(type==='diagonal')mDiagonal(g,R,C,S,E);
}
function wall(g,r,c,S,E){if(r<0||r>=g.length||c<0||c>=g[0].length)return;if(g[r][c]===S||g[r][c]===E)return;g[r][c].wall=true;}
function mRandom(g,R,C,S,E){for(var r=0;r<R;r++)for(var c=0;c<C;c++)if(g[r][c]!==S&&g[r][c]!==E)g[r][c].wall=Math.random()<0.28;}
function mSpiral(g,R,C,S,E){var t=0,b=R-1,l=0,ri=C-1;while(t<=b&&l<=ri){for(var c=l;c<=ri;c++)wall(g,t,c,S,E);for(var r=t+1;r<=b;r++)wall(g,r,ri,S,E);if(t<b)for(var c2=ri-1;c2>=l;c2--)wall(g,b,c2,S,E);if(l<ri)for(var r2=b-1;r2>t;r2--)wall(g,r2,l,S,E);t+=2;b-=2;l+=2;ri-=2;}}
function mChambers(g,R,C,S,E){var dc=[Math.floor(C/3),Math.floor(2*C/3)];for(var i=0;i<dc.length;i++){for(var r=0;r<R;r++)wall(g,r,dc[i],S,E);var gp=1+Math.floor(Math.random()*(R-3));g[gp][dc[i]].wall=false;if(gp+1<R)g[gp+1][dc[i]].wall=false;}var hd=Math.floor(R/2);for(var c=0;c<C;c++)wall(g,hd,c,S,E);var g2=1+Math.floor(Math.random()*(C-2));g[hd][g2].wall=false;if(g2+1<C)g[hd][g2+1].wall=false;}
function mRecursive(g,R,C,S,E){for(var r=0;r<R;r++){wall(g,r,0,S,E);wall(g,r,C-1,S,E);}for(var c=0;c<C;c++){wall(g,0,c,S,E);wall(g,R-1,c,S,E);}divide(g,1,1,R-2,C-2,R>C,S,E);}
function divide(g,r1,c1,r2,c2,horiz,S,E){if(r2-r1<2||c2-c1<2)return;if(horiz){var wr=r1+Math.floor(Math.random()*Math.floor((r2-r1)/2))*2+1,gp=c1+Math.floor(Math.random()*Math.ceil((c2-c1+1)/2))*2;for(var c=c1;c<=c2;c++)if(c!==gp)wall(g,wr,c,S,E);divide(g,r1,c1,wr-1,c2,(wr-r1)>(c2-c1),S,E);divide(g,wr+1,c1,r2,c2,(r2-wr)>(c2-c1),S,E);}else{var wc=c1+Math.floor(Math.random()*Math.floor((c2-c1)/2))*2+1,gp2=r1+Math.floor(Math.random()*Math.ceil((r2-r1+1)/2))*2;for(var r3=r1;r3<=r2;r3++)if(r3!==gp2)wall(g,r3,wc,S,E);divide(g,r1,c1,r2,wc-1,(r2-r1)>(wc-c1),S,E);divide(g,r1,wc+1,r2,c2,(r2-r1)>(c2-wc),S,E);}}
function mCorridor(g,R,C,S,E){for(var r=2;r<R-1;r+=2){for(var c=0;c<C;c++)wall(g,r,c,S,E);var gp=1+Math.floor(Math.random()*(C-2));g[r][gp].wall=false;if(gp+1<C)g[r][gp+1].wall=false;}}
function mDiagonal(g,R,C,S,E){for(var r=1;r<R-1;r++)for(var c=1;c<C-1;c++)if((r+c)%4===0)wall(g,r,c,S,E);}

/* ── CAR ANIMATION ── */
var carAnimId=null,carRunning=false;
function stopCar(){if(carAnimId){cancelAnimationFrame(carAnimId);carAnimId=null;}carRunning=false;}
function animateCar(ctx,path,cs,speed){
  return new Promise(function(resolve){
    stopCar();
    if(!path||path.length<2){resolve();return;}
    cs=cs||CELL;carRunning=true;
    var wps=path.map(c=>({x:c.c*cs+cs/2,y:c.r*cs+cs/2}));
    var spd=1+speed*1.4,wpIdx=1,x=wps[0].x,y=wps[0].y,angle=0;
    function frame(){
      if(!carRunning){resolve();return;}
      var tgt=wps[wpIdx],dx=tgt.x-x,dy=tgt.y-y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<spd){x=tgt.x;y=tgt.y;wpIdx++;if(wpIdx>=wps.length){carRunning=false;resolve();return;}}
      else{angle=Math.atan2(dy,dx);x+=dx/dist*spd;y+=dy/dist*spd;}
      drawCar(ctx,x,y,angle,wpIdx>=wps.length-1,cs);
      carAnimId=requestAnimationFrame(frame);
    }
    carAnimId=requestAnimationFrame(frame);
  });
}
function drawCar(ctx,x,y,angle,atGoal,cs){
  var W=cs*.72,H=cs*.44;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.shadowColor=atGoal?'#00ff88':'#ffffff';ctx.shadowBlur=14;
  ctx.fillStyle='#000';ctx.beginPath();ctx.roundRect(-W/2,-H/2,W,H,H*.18);ctx.fill();
  ctx.fillStyle=atGoal?'#00ff88':'#ffffff';ctx.beginPath();ctx.roundRect(-W/2+1,-H/2+1,W-2,H-2,H*.14);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(-W/2+2,H*.05,W-4,H*.22);
  ctx.fillStyle='#1a1a2e';ctx.beginPath();ctx.roundRect(-W/2+3,-H/2+2,W-6,H*.38,2);ctx.fill();
  ctx.shadowBlur=0;ctx.restore();
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

/* ── PYTHON BACKEND BRIDGE ── */
var PYTHON_API = 'http://127.0.0.1:5000/api/pathfind';

function gridToWalls(g) {
  var walls = [];
  for (var r = 0; r < g.length; r++) {
    for (var c = 0; c < g[r].length; c++) {
      if (g[r][c].wall) walls.push([r, c]);
    }
  }
  return walls;
}

function coordsToCells(coords, g) {
  return (coords || []).map(function(pos) {
    return g[pos[0]][pos[1]];
  });
}

async function runPythonAlgo(algo, start, end, g, R, C) {
  var payload = {
    algorithm: algo,
    rows: R,
    cols: C,
    start: [start.r, start.c],
    end: [end.r, end.c],
    diagonal: false,
    walls: gridToWalls(g)
  };

  var response = await fetch(PYTHON_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Python backend error. Start server.py first.');
  }

  var data = await response.json();
  return {
    visited: coordsToCells(data.visited, g),
    path: coordsToCells(data.path, g),
    pathCost: data.pathCost || 0,
    time_ms: data.time_ms || 0
  };
}
