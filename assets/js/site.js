(function () {
  const root = document.documentElement;
  const field = document.querySelector("[data-topo-field]");
  const svg = field ? field.querySelector(".topo-svg") : null;
  if (!field || !svg) return;

  const VIEW_WIDTH = 1440;
  const VIEW_HEIGHT = 960;
  const GRID_COLUMNS = 78;
  const GRID_ROWS = 52;
  const FRAME_INTERVAL = 1000 / 30;
  const EDGE_PADDING = 56;
  const SOURCE_PADDING = 68;
  const SOURCE_GAP = 110;
  const TRAIL_LIFETIME = 2400;
  const TRAIL_MIN_DISTANCE = 9;
  const TRAIL_MAX_POINTS = 280;
  const TRAIL_WINDOWS = [
    { minAge: 0, maxAge: 760, alpha: 0.17, width: 0.95 },
    { minAge: 760, maxAge: 1580, alpha: 0.1, width: 0.82 },
    { minAge: 1580, maxAge: TRAIL_LIFETIME, alpha: 0.05, width: 0.72 },
  ];
  const MOVE_MARK_LIFETIME = 5000;
  const MOVE_MARK_MIN_DISTANCE = 24;
  const MOVE_MARK_MAX = 96;
  const MOVE_MARK_SIZE = 5.9;
  const CLICK_MARK_LIFETIME = 5000;
  const CLICK_MARK_MAX = 36;
  const CLICK_MARK_SIZE = 7.1;
  const CURSOR_MARK_SIZE = 6.8;
  const THRESHOLDS = [0.18, 0.26, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82];
  const sources = [];
  const contourPaths = [];
  const trailPoints = [];
  const trailPaths = [];
  const moveMarks = [];
  const clickMarks = [];
  const pointer = {
    x: VIEW_WIDTH * 0.5,
    y: VIEW_HEIGHT * 0.5,
    active: false,
    enabled: true,
  };
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let safeRects = [];
  let contourLayer = null;
  let trailLayer = null;
  let echoLayer = null;
  let cursorLayer = null;
  let clickLayer = null;
  let cursorMarkPath = null;
  let rafId = 0;
  let lastFrame = 0;
  let lastTimestamp = 0;
  let scrollBias = 0;

  function themeNumber(name, fallback) {
    const value = Number.parseFloat(getComputedStyle(root).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  }

  function themeString(name, fallback) {
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || fallback;
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(t) {
    const clamped = clamp(t, 0, 1);
    return clamped * clamped * (3 - 2 * clamped);
  }

  function createSvgElement(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function viewportToViewX(value) {
    return (value / window.innerWidth) * VIEW_WIDTH;
  }

  function viewportToViewY(value) {
    return (value / window.innerHeight) * VIEW_HEIGHT;
  }

  function pointKey(point) {
    return `${Math.round(point.x * 2)}:${Math.round(point.y * 2)}`;
  }

  function pointDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function copyPoint(point) {
    return { x: point.x, y: point.y };
  }

  function buildCrossPath(x, y, size) {
    const x0 = (x - size).toFixed(2);
    const y0 = (y - size).toFixed(2);
    const x1 = (x + size).toFixed(2);
    const y1 = (y + size).toFixed(2);
    const x2 = (x - size).toFixed(2);
    const y2 = (y + size).toFixed(2);
    const x3 = (x + size).toFixed(2);
    const y3 = (y - size).toFixed(2);
    return `M ${x0} ${y0} L ${x1} ${y1} M ${x2} ${y2} L ${x3} ${y3}`;
  }

  function hash3(x, y, z) {
    const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
    return value - Math.floor(value);
  }

  function valueNoise(x, y, z) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const xf = x - xi;
    const yf = y - yi;
    const zf = z - zi;
    const u = smoothstep(xf);
    const v = smoothstep(yf);
    const w = smoothstep(zf);

    const n000 = hash3(xi, yi, zi);
    const n100 = hash3(xi + 1, yi, zi);
    const n010 = hash3(xi, yi + 1, zi);
    const n110 = hash3(xi + 1, yi + 1, zi);
    const n001 = hash3(xi, yi, zi + 1);
    const n101 = hash3(xi + 1, yi, zi + 1);
    const n011 = hash3(xi, yi + 1, zi + 1);
    const n111 = hash3(xi + 1, yi + 1, zi + 1);

    const nx00 = lerp(n000, n100, u);
    const nx10 = lerp(n010, n110, u);
    const nx01 = lerp(n001, n101, u);
    const nx11 = lerp(n011, n111, u);
    const nxy0 = lerp(nx00, nx10, v);
    const nxy1 = lerp(nx01, nx11, v);

    return lerp(nxy0, nxy1, w);
  }

  function fbm(x, y, z) {
    let amplitude = 0.5;
    let frequency = 1;
    let sum = 0;
    let total = 0;

    for (let octave = 0; octave < 4; octave += 1) {
      sum += valueNoise(x * frequency, y * frequency, z * frequency) * amplitude;
      total += amplitude;
      amplitude *= 0.5;
      frequency *= 2.05;
    }

    return sum / total;
  }

  function ridgedFbm(x, y, z) {
    let amplitude = 0.55;
    let frequency = 1;
    let sum = 0;
    let total = 0;

    for (let octave = 0; octave < 3; octave += 1) {
      const n = valueNoise(x * frequency, y * frequency, z * frequency);
      const ridge = 1 - Math.abs(n * 2 - 1);
      sum += ridge * amplitude;
      total += amplitude;
      amplitude *= 0.55;
      frequency *= 2.1;
    }

    return sum / total;
  }

  function computeSafeRects() {
    const body = document.body;
    const explicitSafe = Array.from(document.querySelectorAll("[data-topo-safe]"));
    const useExplicitOnly = body.classList.contains("contour-page");

    if (explicitSafe.length) {
      return explicitSafe.map((node) => {
        const rect = node.getBoundingClientRect();
        const insetX = Math.min(rect.width * 0.06, 44);
        const insetY = Math.min(rect.height * 0.08, 34);
        return {
          left: viewportToViewX(rect.left + insetX),
          right: viewportToViewX(rect.right - insetX),
          top: viewportToViewY(rect.top + insetY),
          bottom: viewportToViewY(rect.bottom - insetY),
        };
      });
    }

    if (useExplicitOnly) {
      return [];
    }

    const flow = document.querySelector(".site-main-flow");
    if (!flow) return [];
    const rect = flow.getBoundingClientRect();
    const insetX = Math.min(rect.width * 0.08, 72);
    return [
      {
        left: viewportToViewX(rect.left + insetX),
        right: viewportToViewX(rect.right - insetX),
        top: viewportToViewY(Math.max(rect.top, 108)),
        bottom: viewportToViewY(Math.min(window.innerHeight - 68, rect.bottom - 24)),
      },
    ];
  }

  function safeInfluence(x, y) {
    let strongest = 0;
    safeRects.forEach((rect) => {
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const distance = Math.hypot(dx, dy);
      const influence = distance === 0 ? 1 : smoothstep(1 - distance / 180);
      strongest = Math.max(strongest, influence);
    });
    return strongest;
  }

  function placeSource(index) {
    const anchors = [
      { x: 0.22, y: 0.24, strength: 0.68 },
      { x: 0.78, y: 0.22, strength: 0.64 },
      { x: 0.26, y: 0.76, strength: 0.62 },
      { x: 0.74, y: 0.76, strength: 0.66 },
      { x: 0.52, y: 0.18, strength: -0.28 },
    ];
    const anchor = anchors[index % anchors.length];
    return {
      x: VIEW_WIDTH * anchor.x + random(-32, 32),
      y: VIEW_HEIGHT * anchor.y + random(-26, 26),
      vx: random(-0.012, 0.012),
      vy: random(-0.012, 0.012),
      radiusX: random(220, 320),
      radiusY: random(150, 240),
      rotation: random(0, Math.PI),
      rotationVelocity: random(-0.00001, 0.00001),
      phase: random(0, Math.PI * 2),
      phaseVelocity: random(0.00018, 0.00042),
      strength: anchor.strength + random(-0.04, 0.04),
    };
  }

  function resolveSourceBoundaries() {
    for (let i = 0; i < sources.length; i += 1) {
      for (let j = i + 1; j < sources.length; j += 1) {
        const a = sources[i];
        const b = sources[j];
        const minGap =
          Math.max(a.radiusX, a.radiusY) * 0.58 +
          Math.max(b.radiusX, b.radiusY) * 0.58 +
          SOURCE_GAP;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.hypot(dx, dy) || 0.001;

        if (distance < minGap) {
          const overlap = (minGap - distance) * 0.5;
          dx /= distance;
          dy /= distance;
          a.x -= dx * overlap;
          a.y -= dy * overlap;
          b.x += dx * overlap;
          b.y += dy * overlap;
          a.vx -= dx * 0.018;
          a.vy -= dy * 0.018;
          b.vx += dx * 0.018;
          b.vy += dy * 0.018;
        }
      }
    }
  }

  function constrainSource(source) {
    const radius = Math.max(source.radiusX, source.radiusY) * 0.5;
    if (source.x - radius < EDGE_PADDING) {
      source.x = EDGE_PADDING + radius;
      source.vx = Math.abs(source.vx) * 0.88;
    }
    if (source.x + radius > VIEW_WIDTH - EDGE_PADDING) {
      source.x = VIEW_WIDTH - EDGE_PADDING - radius;
      source.vx = -Math.abs(source.vx) * 0.88;
    }
    if (source.y - radius < EDGE_PADDING) {
      source.y = EDGE_PADDING + radius;
      source.vy = Math.abs(source.vy) * 0.88;
    }
    if (source.y + radius > VIEW_HEIGHT - EDGE_PADDING) {
      source.y = VIEW_HEIGHT - EDGE_PADDING - radius;
      source.vy = -Math.abs(source.vy) * 0.88;
    }

    safeRects.forEach((rect) => {
      const expanded = {
        left: rect.left - radius - SOURCE_PADDING,
        right: rect.right + radius + SOURCE_PADDING,
        top: rect.top - radius - SOURCE_PADDING,
        bottom: rect.bottom + radius + SOURCE_PADDING,
      };

      if (
        source.x > expanded.left &&
        source.x < expanded.right &&
        source.y > expanded.top &&
        source.y < expanded.bottom
      ) {
        const pushes = [
          { distance: Math.abs(source.x - expanded.left), x: expanded.left, y: source.y, vx: -0.18, vy: 0 },
          { distance: Math.abs(expanded.right - source.x), x: expanded.right, y: source.y, vx: 0.18, vy: 0 },
          { distance: Math.abs(source.y - expanded.top), x: source.x, y: expanded.top, vx: 0, vy: -0.18 },
          { distance: Math.abs(expanded.bottom - source.y), x: source.x, y: expanded.bottom, vx: 0, vy: 0.18 },
        ].sort((a, b) => a.distance - b.distance)[0];

        source.x = pushes.x;
        source.y = pushes.y;
        source.vx += pushes.vx;
        source.vy += pushes.vy;
      }
    });
  }

  function updateSources(delta, timeSeconds) {
    sources.forEach((source, index) => {
      source.phase += source.phaseVelocity * delta * (1 + scrollBias * 0.03);
      source.rotation += source.rotationVelocity * delta;
      source.x += source.vx * delta;
      source.y += source.vy * delta;
      source.vx *= 0.9984;
      source.vy *= 0.9984;
      source.vx += Math.sin(timeSeconds * 0.08 + index * 1.1) * 0.00008 * delta;
      source.vy += Math.cos(timeSeconds * 0.075 + index * 1.7) * 0.00008 * delta;
    });

    resolveSourceBoundaries();
    sources.forEach((source) => constrainSource(source));
  }

  function sourceContribution(source, x, y) {
    const phaseScaleX = 1 + 0.09 * Math.sin(source.phase);
    const phaseScaleY = 1 + 0.08 * Math.cos(source.phase * 1.2);
    const radiusX = source.radiusX * phaseScaleX;
    const radiusY = source.radiusY * phaseScaleY;
    const cosR = Math.cos(source.rotation);
    const sinR = Math.sin(source.rotation);
    const dx = x - source.x;
    const dy = y - source.y;
    const localX = (dx * cosR + dy * sinR) / radiusX;
    const localY = (-dx * sinR + dy * cosR) / radiusY;
    return Math.exp(-(localX * localX + localY * localY) * 1.32) * source.strength;
  }

  function fieldValue(nx, ny, timeSeconds) {
    const x = nx * VIEW_WIDTH;
    const y = ny * VIEW_HEIGHT;
    const coarseX = nx * 2.22;
    const coarseY = ny * 1.95;
    const warpA = fbm(coarseX + 2.7, coarseY - 1.9, timeSeconds * 0.022);
    const warpB = fbm(coarseX * 1.14 - 9.1, coarseY * 1.08 + 4.2, timeSeconds * 0.022 + 18.5);
    const warpedX = coarseX + (warpA - 0.5) * 0.54;
    const warpedY = coarseY + (warpB - 0.5) * 0.54;
    let value = 0;

    sources.forEach((source) => {
      value += sourceContribution(source, x, y);
    });

    value += (fbm(warpedX * 1.45 + 4.6, warpedY * 1.45 - 3.2, timeSeconds * 0.028) - 0.5) * 0.11;
    value += (ridgedFbm(warpedX * 1.62, warpedY * 1.62, timeSeconds * 0.018) - 0.5) * 0.045;

    const centerFalloff = 1 - Math.min(Math.hypot(nx - 0.5, ny - 0.48) / 0.8, 1);
    value += (0.48 - centerFalloff) * 0.04;

    const safe = safeInfluence(x, y);
    if (safe > 0) {
      value = lerp(value, 0.06, safe * 0.8);
    }

    return value;
  }

  function computeField(timeSeconds) {
    const values = new Float32Array((GRID_COLUMNS + 1) * (GRID_ROWS + 1));
    let min = Infinity;
    let max = -Infinity;

    for (let y = 0; y <= GRID_ROWS; y += 1) {
      const ny = y / GRID_ROWS;
      for (let x = 0; x <= GRID_COLUMNS; x += 1) {
        const value = fieldValue(x / GRID_COLUMNS, ny, timeSeconds);
        const index = y * (GRID_COLUMNS + 1) + x;
        values[index] = value;
        if (value < min) min = value;
        if (value > max) max = value;
      }
    }

    return { values, min, max };
  }

  function interpolate(x1, y1, v1, x2, y2, v2, threshold) {
    const delta = v2 - v1;
    const amount = Math.abs(delta) < 1e-6 ? 0.5 : (threshold - v1) / delta;
    return {
      x: lerp(x1, x2, clamp(amount, 0, 1)),
      y: lerp(y1, y2, clamp(amount, 0, 1)),
    };
  }

  function caseSegments(state, center, edges, threshold) {
    if (state === 0 || state === 15) return [];

    const table = {
      1: [[3, 0]],
      2: [[0, 1]],
      3: [[3, 1]],
      4: [[1, 2]],
      6: [[0, 2]],
      7: [[3, 2]],
      8: [[2, 3]],
      9: [[0, 2]],
      11: [[1, 2]],
      12: [[1, 3]],
      13: [[0, 1]],
      14: [[0, 3]],
    };

    if (state === 5) {
      return center >= threshold ? [[3, 2], [0, 1]] : [[3, 0], [2, 1]];
    }

    if (state === 10) {
      return center >= threshold ? [[0, 3], [1, 2]] : [[0, 1], [2, 3]];
    }

    return table[state] || [];
  }

  function joinSegments(segments) {
    const adjacency = new Map();
    const used = new Array(segments.length).fill(false);
    const lines = [];

    segments.forEach((segment, index) => {
      [segment.a, segment.b].forEach((point) => {
        const key = pointKey(point);
        if (!adjacency.has(key)) adjacency.set(key, []);
        adjacency.get(key).push(index);
      });
    });

    function grow(points, fromStart) {
      let current = fromStart ? points[0] : points[points.length - 1];
      let key = pointKey(current);

      while (true) {
        const candidates = adjacency.get(key) || [];
        let nextIndex = -1;
        let nextPoint = null;

        for (const candidate of candidates) {
          if (used[candidate]) continue;
          const segment = segments[candidate];
          const useA = pointKey(segment.a) === key;
          nextIndex = candidate;
          nextPoint = useA ? segment.b : segment.a;
          break;
        }

        if (nextIndex === -1 || !nextPoint) break;
        used[nextIndex] = true;
        if (fromStart) {
          points.unshift(nextPoint);
          current = points[0];
        } else {
          points.push(nextPoint);
          current = points[points.length - 1];
        }
        key = pointKey(current);
      }
    }

    segments.forEach((segment, index) => {
      if (used[index]) return;
      used[index] = true;
      const points = [segment.a, segment.b];
      grow(points, true);
      grow(points, false);
      lines.push(points);
    });

    return lines;
  }

  function buildPath(points, closed) {
    if (points.length < 2) return "";
    if (points.length === 2) {
      return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
    }

    if (closed) {
      let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length; i += 1) {
        const p0 = points[(i - 1 + points.length) % points.length];
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const p3 = points[(i + 2) % points.length];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return `${path} Z`;
    }

    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  }

  function smoothLine(points, closed) {
    if (points.length < 4) return points;

    let current = points.map(copyPoint);
    if (current.length > 6) {
      const cut = [];

      if (!closed) {
        cut.push(copyPoint(current[0]));
      }

      for (let i = 0; i < current.length - 1; i += 1) {
        const start = current[i];
        const end = current[i + 1];
        cut.push({
          x: start.x * 0.78 + end.x * 0.22,
          y: start.y * 0.78 + end.y * 0.22,
        });
        cut.push({
          x: start.x * 0.22 + end.x * 0.78,
          y: start.y * 0.22 + end.y * 0.78,
        });
      }

      if (closed) {
        const start = current[current.length - 1];
        const end = current[0];
        cut.push({
          x: start.x * 0.78 + end.x * 0.22,
          y: start.y * 0.78 + end.y * 0.22,
        });
        cut.push({
          x: start.x * 0.22 + end.x * 0.78,
          y: start.y * 0.22 + end.y * 0.78,
        });
      } else {
        cut.push(copyPoint(current[current.length - 1]));
      }

      current = cut;
    }

    const passes = current.length > 24 ? 2 : 1;

    for (let pass = 0; pass < passes; pass += 1) {
      const next = current.map((point, index) => {
        if (!closed && (index === 0 || index === current.length - 1)) {
          return copyPoint(point);
        }

        const previous = current[(index - 1 + current.length) % current.length];
        const upcoming = current[(index + 1) % current.length];

        return {
          x: previous.x * 0.2 + point.x * 0.6 + upcoming.x * 0.2,
          y: previous.y * 0.2 + point.y * 0.6 + upcoming.y * 0.2,
        };
      });

      current = next;
    }

    return current;
  }

  function registerTrailPoint(x, y, timestamp) {
    if (!pointer.enabled) return;

    const lastPoint = trailPoints[trailPoints.length - 1];
    if (lastPoint && pointDistance(lastPoint, { x, y }) < TRAIL_MIN_DISTANCE) {
      lastPoint.time = timestamp;
      lastPoint.x = x;
      lastPoint.y = y;
      return;
    }

    trailPoints.push({ x, y, time: timestamp });
    if (trailPoints.length > TRAIL_MAX_POINTS) {
      trailPoints.splice(0, trailPoints.length - TRAIL_MAX_POINTS);
    }
  }

  function registerMoveMark(x, y, timestamp) {
    if (!pointer.enabled) return;

    const lastMark = moveMarks[moveMarks.length - 1];
    if (lastMark && pointDistance(lastMark, { x, y }) < MOVE_MARK_MIN_DISTANCE) {
      lastMark.time = timestamp;
      lastMark.x = x;
      lastMark.y = y;
      return;
    }

    moveMarks.push({ x, y, time: timestamp });
    if (moveMarks.length > MOVE_MARK_MAX) {
      moveMarks.splice(0, moveMarks.length - MOVE_MARK_MAX);
    }
  }

  function renderTrail(timestamp) {
    const trailRgb = themeString("--topo-trail-rgb", "70, 84, 96");
    while (trailPoints.length && timestamp - trailPoints[0].time > TRAIL_LIFETIME) {
      trailPoints.shift();
    }

    trailPaths.forEach((path, index) => {
      const window = TRAIL_WINDOWS[index];
      const points = trailPoints.filter((point) => {
        const age = timestamp - point.time;
        return age >= window.minAge && age < window.maxAge;
      });

      if (points.length < 2) {
        path.setAttribute("d", "");
        return;
      }

      const d = buildPath(smoothLine(points, false), false);
      path.setAttribute("d", d);
      path.setAttribute("stroke-width", window.width.toFixed(2));
      path.setAttribute("stroke", `rgba(${trailRgb}, ${window.alpha})`);
    });
  }

  function renderMoveMarks(timestamp) {
    while (moveMarks.length && timestamp - moveMarks[0].time > MOVE_MARK_LIFETIME) {
      moveMarks.shift();
    }

    echoLayer.innerHTML = moveMarks
      .map((mark) => {
        const age = timestamp - mark.time;
        const progress = clamp(age / MOVE_MARK_LIFETIME, 0, 1);
        const opacity = lerp(0.26, 0, smoothstep(progress));
        const size = lerp(MOVE_MARK_SIZE, MOVE_MARK_SIZE + 1.1, progress * 0.8);
        return `<path class="topo-echo-mark" d="${buildCrossPath(mark.x, mark.y, size)}" style="opacity:${opacity.toFixed(
          3
        )}" />`;
      })
      .join("");
  }

  function renderPointerMark() {
    if (!cursorMarkPath) return;

    if (!pointer.active || !pointer.enabled) {
      cursorMarkPath.setAttribute("d", "");
      cursorMarkPath.style.opacity = "0";
      return;
    }

    cursorMarkPath.setAttribute("d", buildCrossPath(pointer.x, pointer.y, CURSOR_MARK_SIZE));
    cursorMarkPath.style.opacity = "0.28";
  }

  function registerClickMark(x, y, timestamp) {
    clickMarks.push({ x, y, time: timestamp });
    if (clickMarks.length > CLICK_MARK_MAX) {
      clickMarks.splice(0, clickMarks.length - CLICK_MARK_MAX);
    }
  }

  function renderClickMarks(timestamp) {
    while (clickMarks.length && timestamp - clickMarks[0].time > CLICK_MARK_LIFETIME) {
      clickMarks.shift();
    }

    clickLayer.innerHTML = clickMarks
      .map((mark) => {
        const age = timestamp - mark.time;
        const progress = clamp(age / CLICK_MARK_LIFETIME, 0, 1);
        const opacity = lerp(0.3, 0, smoothstep(progress));
        const size = lerp(CLICK_MARK_SIZE, CLICK_MARK_SIZE + 1.2, progress * 0.6);
        return `<path class="topo-click-mark" d="${buildCrossPath(mark.x, mark.y, size)}" style="opacity:${opacity.toFixed(
          3
        )}" />`;
      })
      .join("");
  }

  function buildContours(fieldData, normalizedThreshold) {
    const { values, min, max } = fieldData;
    const threshold = lerp(min, max, normalizedThreshold);
    const cellWidth = VIEW_WIDTH / GRID_COLUMNS;
    const cellHeight = VIEW_HEIGHT / GRID_ROWS;
    const segments = [];

    function valueAt(x, y) {
      return values[y * (GRID_COLUMNS + 1) + x];
    }

    for (let row = 0; row < GRID_ROWS; row += 1) {
      for (let column = 0; column < GRID_COLUMNS; column += 1) {
        const x0 = column * cellWidth;
        const x1 = (column + 1) * cellWidth;
        const y0 = row * cellHeight;
        const y1 = (row + 1) * cellHeight;

        const tl = valueAt(column, row);
        const tr = valueAt(column + 1, row);
        const br = valueAt(column + 1, row + 1);
        const bl = valueAt(column, row + 1);
        const state =
          (tl >= threshold ? 1 : 0) |
          (tr >= threshold ? 2 : 0) |
          (br >= threshold ? 4 : 0) |
          (bl >= threshold ? 8 : 0);

        if (state === 0 || state === 15) continue;

        const edges = [
          interpolate(x0, y0, tl, x1, y0, tr, threshold),
          interpolate(x1, y0, tr, x1, y1, br, threshold),
          interpolate(x0, y1, bl, x1, y1, br, threshold),
          interpolate(x0, y0, tl, x0, y1, bl, threshold),
        ];

        const center = (tl + tr + br + bl) * 0.25;
        caseSegments(state, center, edges, threshold).forEach(([start, end]) => {
          segments.push({
            a: edges[start],
            b: edges[end],
          });
        });
      }
    }

    return joinSegments(segments);
  }

  function renderContours(timestamp) {
    const toneMin = themeNumber("--topo-tone-min", 58);
    const toneMax = themeNumber("--topo-tone-max", 170);
    const strongAlpha = themeNumber("--topo-line-alpha-strong", 0.24);
    const softAlpha = themeNumber("--topo-line-alpha-soft", 0.11);
    const timeSeconds = timestamp * 0.001;
    const fieldData = computeField(timeSeconds);
    const cellSpan = Math.max(VIEW_WIDTH / GRID_COLUMNS, VIEW_HEIGHT / GRID_ROWS);

    THRESHOLDS.forEach((threshold, index) => {
      const lines = buildContours(fieldData, threshold);
      const d = lines
        .map((points) => {
          const closed = points.length > 3 && pointDistance(points[0], points[points.length - 1]) < cellSpan * 1.2;
          return buildPath(smoothLine(points, closed), closed);
        })
        .join(" ");

      const shadePhase = 0.5 + 0.5 * Math.sin(timeSeconds * 0.08 + index * 0.25);
      const tone = Math.round(toneMin + shadePhase * (toneMax - toneMin));
      const emphasis = index % 3 === 0;
      contourPaths[index].setAttribute("d", d);
      contourPaths[index].setAttribute(
        "stroke",
        `rgba(${tone}, ${tone}, ${tone}, ${emphasis ? strongAlpha : softAlpha})`
      );
      contourPaths[index].setAttribute("stroke-width", emphasis ? "1.6" : "0.95");
    });
  }

  function frame(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = Math.min(timestamp - lastTimestamp, 40);
    lastTimestamp = timestamp;
    scrollBias *= 0.82;

    if (!reducedMotionQuery.matches) {
      updateSources(delta, timestamp * 0.001);
    }

    if (reducedMotionQuery.matches || timestamp - lastFrame >= FRAME_INTERVAL) {
      renderContours(timestamp);
      lastFrame = timestamp;
    }

    renderTrail(timestamp);
    renderMoveMarks(timestamp);
    renderPointerMark();
    renderClickMarks(timestamp);

    if (!reducedMotionQuery.matches || trailPoints.length || moveMarks.length || clickMarks.length) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      rafId = 0;
    }
  }

  function rebuildSafeZones() {
    safeRects = computeSafeRects();
  }

  function resetContours() {
    svg.innerHTML = "";
    svg.setAttribute("shape-rendering", "geometricPrecision");
    contourPaths.length = 0;
    trailPaths.length = 0;
    sources.length = 0;
    trailPoints.length = 0;
    moveMarks.length = 0;
    clickMarks.length = 0;
    rebuildSafeZones();

    contourLayer = createSvgElement("g");
    contourLayer.setAttribute("class", "topo-contours");
    trailLayer = createSvgElement("g");
    trailLayer.setAttribute("class", "topo-trails");
    echoLayer = createSvgElement("g");
    echoLayer.setAttribute("class", "topo-echoes");
    cursorLayer = createSvgElement("g");
    cursorLayer.setAttribute("class", "topo-cursor");
    clickLayer = createSvgElement("g");
    clickLayer.setAttribute("class", "topo-clicks");
    svg.appendChild(contourLayer);
    svg.appendChild(trailLayer);
    svg.appendChild(echoLayer);
    svg.appendChild(cursorLayer);
    svg.appendChild(clickLayer);

    THRESHOLDS.forEach(() => {
      const path = createSvgElement("path");
      path.setAttribute("class", "topo-path");
      contourLayer.appendChild(path);
      contourPaths.push(path);
    });

    TRAIL_WINDOWS.forEach(() => {
      const path = createSvgElement("path");
      path.setAttribute("class", "topo-trail-path");
      trailLayer.appendChild(path);
      trailPaths.push(path);
    });

    cursorMarkPath = createSvgElement("path");
    cursorMarkPath.setAttribute("class", "topo-pointer-mark");
    cursorMarkPath.setAttribute("stroke-width", "1.15");
    cursorMarkPath.style.opacity = "0";
    cursorLayer.appendChild(cursorMarkPath);

    for (let index = 0; index < 5; index += 1) {
      sources.push(placeSource(index));
    }

    resolveSourceBoundaries();
    renderContours(0);
    renderPointerMark();
  }

  function restart() {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
    lastFrame = 0;
    lastTimestamp = 0;
    resetContours();
    if (!reducedMotionQuery.matches || trailPoints.length || moveMarks.length || clickMarks.length) {
      rafId = window.requestAnimationFrame(frame);
    }
  }

  window.addEventListener("resize", restart);
  window.addEventListener(
    "scroll",
    () => {
      scrollBias = clamp(scrollBias + 0.04, -0.4, 0.4);
      rebuildSafeZones();
    },
    { passive: true }
  );

  document.addEventListener("pointermove", (event) => {
    const timestamp = performance.now();
    pointer.x = viewportToViewX(event.clientX);
    pointer.y = viewportToViewY(event.clientY);
    pointer.active = pointer.enabled;
    registerTrailPoint(pointer.x, pointer.y, timestamp);
    registerMoveMark(pointer.x, pointer.y, timestamp);

    if (!rafId) {
      rafId = window.requestAnimationFrame(frame);
    }
  });

  document.addEventListener("pointerleave", () => {
    pointer.active = false;
    renderPointerMark();
  });

  document.addEventListener("pointerdown", (event) => {
    const timestamp = performance.now();
    registerClickMark(viewportToViewX(event.clientX), viewportToViewY(event.clientY), timestamp);
    if (!rafId) {
      rafId = window.requestAnimationFrame(frame);
    }
  });

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", restart);
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(restart);
  }

  restart();
})();

(function () {
  const root = document.documentElement;
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  const storageKey = "site-theme";

  function currentTheme() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function updateButton(theme) {
    const nextTheme = theme === "dark" ? "light" : "dark";
    button.textContent = theme === "dark" ? "☀" : "☾";
    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    button.setAttribute("title", `Switch to ${nextTheme} mode`);
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    updateButton(theme);

    if (persist) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {
        // Ignore storage failures and keep the in-memory theme.
      }
    }

    window.dispatchEvent(new Event("resize"));
  }

  button.addEventListener("click", () => {
    applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
  });

  updateButton(currentTheme());
})();

(function () {
  const emailLinks = Array.from(document.querySelectorAll("[data-email-link]"));
  if (!emailLinks.length) return;

  emailLinks.forEach((link) => {
    const local = link.getAttribute("data-email-local");
    const domain = link.getAttribute("data-email-domain");
    if (!local || !domain) return;

    const address = `${local}@${domain}`;
    link.setAttribute("href", `mailto:${address}`);
    link.setAttribute("aria-label", address);
    link.setAttribute("title", address);
    link.textContent = address;
  });
})();

(function () {
  const groups = document.querySelectorAll("[data-filter-group]");
  if (!groups.length) return;

  groups.forEach((group) => {
    const target =
      group.parentElement.querySelector("[data-filter-target]") ||
      document.querySelector("[data-filter-target]");
    if (!target) return;

    const buttons = Array.from(group.querySelectorAll("[data-filter]"));
    const cards = Array.from(target.querySelectorAll("[data-tags]"));
    const defaultFilter = group.dataset.filterDefault || "all";

    function setFilter(filter) {
      buttons.forEach((button) => {
        const active = (button.dataset.filter || "all") === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split("|").filter(Boolean);
        const matches = filter === "all" || tags.includes(filter);
        card.hidden = !matches;
      });
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => setFilter(button.dataset.filter || "all"));
    });

    setFilter(defaultFilter);
  });
})();
