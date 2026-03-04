// Canvas Drawing System - Fixed initialization & drawing
class DrawingCanvas {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    this.container = document.getElementById(containerId);
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.isDrawing = false;
    this.isEnabled = false;
    this.currentTool = 'pencil';
    this.currentColor = '#000000';
    this.currentSize = 4;
    this.lastX = 0;
    this.lastY = 0;
    this.ready = false;

    this.onDraw = null;
    this.onClear = null;
    this.onUndo = null;
    this.onFill = null;

    this.strokes = [];
    this.currentStroke = [];

    // Set fixed internal resolution immediately
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.scaleX = 1;
    this.scaleY = 1;

    this.setupEvents();
    this.clearCanvas();

    // Defer visual sizing until container has layout
    this._scheduleResize();
  }

  _scheduleResize() {
    // Use rAF to wait for browser to finish layout after screen switch
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.resize();
        this.ready = true;
      });
    });
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // Container not visible yet, retry
      setTimeout(() => this.resize(), 50);
      return;
    }

    const maxW = rect.width - 16;
    const maxH = rect.height - 16;

    // 4:3 aspect ratio
    const aspect = 4 / 3;
    let w, h;
    if (maxW / maxH > aspect) {
      h = maxH;
      w = h * aspect;
    } else {
      w = maxW;
      h = w / aspect;
    }

    w = Math.max(w, 100);
    h = Math.max(h, 75);

    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    this.scaleX = 800 / w;
    this.scaleY = 600 / h;
  }

  setupEvents() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handleEnd(e));

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleStart(touch);
    }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMove(touch);
    }, { passive: false });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleEnd(e);
    }, { passive: false });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resize();
      }, 200);
    });
  }

  getCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left) * (800 / rect.width),
      y: (e.clientY - rect.top) * (600 / rect.height)
    };
  }

  handleStart(e) {
    if (!this.isEnabled) return;
    const { x, y } = this.getCoords(e);

    if (this.currentTool === 'fill') {
      const fx = Math.round(Math.max(0, Math.min(799, x)));
      const fy = Math.round(Math.max(0, Math.min(599, y)));
      this.floodFill(fx, fy, this.currentColor);
      if (this.onFill) {
        this.onFill({ x: fx, y: fy, color: this.currentColor });
      }
      return;
    }

    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
    this.currentStroke = [];

    const color = this.currentTool === 'eraser' ? '#FFFFFF' : this.currentColor;
    const size = this.currentTool === 'eraser' ? this.currentSize * 4 : this.currentSize;

    const data = { type: 'start', x, y, color, size, tool: this.currentTool };
    this.currentStroke.push(data);
    this.drawDot(x, y, color, size);
    if (this.onDraw) this.onDraw(data);
  }

  handleMove(e) {
    if (!this.isEnabled || !this.isDrawing) return;
    const { x, y } = this.getCoords(e);

    const color = this.currentTool === 'eraser' ? '#FFFFFF' : this.currentColor;
    const size = this.currentTool === 'eraser' ? this.currentSize * 4 : this.currentSize;

    const data = { type: 'move', x, y, lastX: this.lastX, lastY: this.lastY, color, size, tool: this.currentTool };
    this.currentStroke.push(data);
    this.drawLine(this.lastX, this.lastY, x, y, color, size);

    this.lastX = x;
    this.lastY = y;
    if (this.onDraw) this.onDraw(data);
  }

  handleEnd(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.currentStroke.length > 0) {
      this.strokes.push([...this.currentStroke]);
      this.currentStroke = [];
    }
  }

  drawDot(x, y, color, size) {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawLine(x1, y1, x2, y2, color, size) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  receiveDrawData(data) {
    if (data.type === 'start') {
      this.drawDot(data.x, data.y, data.color, data.size);
    } else if (data.type === 'move') {
      this.drawLine(data.lastX, data.lastY, data.x, data.y, data.color, data.size);
    } else if (data.type === 'fill') {
      this.floodFill(data.x, data.y, data.color);
    }
  }

  receiveFill(data) {
    this.floodFill(data.x, data.y, data.color);
  }

  replayDrawing(drawingData) {
    this.clearCanvas();
    drawingData.forEach(data => this.receiveDrawData(data));
  }

  clearCanvas() {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, 800, 600);
    this.strokes = [];
    this.currentStroke = [];
  }

  undo() {
    if (this.strokes.length === 0) return;
    this.strokes.pop();
    this.redrawAll();
  }

  redrawAll() {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, 800, 600);
    this.strokes.forEach(stroke => {
      stroke.forEach(data => this.receiveDrawData(data));
    });
  }

  floodFill(startX, startY, fillColor) {
    if (startX < 0 || startX >= 800 || startY < 0 || startY >= 600) return;

    const imageData = this.ctx.getImageData(0, 0, 800, 600);
    const data = imageData.data;
    const fc = this.hexToRgb(fillColor);
    if (!fc) return;

    const startIdx = (startY * 800 + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];

    if (startR === fc.r && startG === fc.g && startB === fc.b) return;

    const tolerance = 30;
    const stack = [[startX, startY]];
    const visited = new Uint8Array(800 * 600);

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= 800 || y < 0 || y >= 600) continue;

      const pixelIdx = y * 800 + x;
      if (visited[pixelIdx]) continue;

      const idx = pixelIdx * 4;
      if (Math.abs(data[idx] - startR) > tolerance ||
          Math.abs(data[idx + 1] - startG) > tolerance ||
          Math.abs(data[idx + 2] - startB) > tolerance) continue;

      visited[pixelIdx] = 1;
      data[idx] = fc.r;
      data[idx + 1] = fc.g;
      data[idx + 2] = fc.b;
      data[idx + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  setColor(color) {
    this.currentColor = color;
    if (this.currentTool === 'eraser') this.currentTool = 'pencil';
  }

  setSize(size) { this.currentSize = size; }

  setTool(tool) {
    this.currentTool = tool;
    this.canvas.style.cursor =
      tool === 'eraser' ? 'cell' :
      tool === 'fill' ? 'crosshair' : 'crosshair';
  }

  enable() {
    this.isEnabled = true;
    this.canvas.style.cursor = 'crosshair';
    // Make sure canvas is sized if it wasn't ready
    if (!this.ready) this._scheduleResize();
  }

  disable() {
    this.isEnabled = false;
    this.isDrawing = false;
    this.canvas.style.cursor = 'default';
  }
}
