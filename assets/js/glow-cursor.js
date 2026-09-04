/**
 * GlowCursor - vanilla JS glowing cursor trail effect.
 * No build step, no dependencies. Works with a plain <script> tag.
 *
 * v2: trail points expire with age (so the trail actually fades away
 * when you stop moving), and rendering is done in a handful of bands
 * instead of one draw call per point (much lighter on the CPU/GPU).
 *
 * Usage:
 *   <div id="glow-box" style="position:relative;width:100%;height:500px;background:#050610;"></div>
 *   <script src="glow-cursor.js"></script>
 *   <script>
 *     GlowCursor.init(document.getElementById('glow-box'), {
 *       color: '#95f00c',
 *       secondaryColor: '#f6dd03',
 *       trailWidth: 7,
 *       trailLifetime: 550,   // ms a point stays visible before fading out
 *       followSpeed: 0.35,
 *       glowIntensity: 1.8,
 *       glowSpread: 1,
 *       hotspot: 0.65,
 *       brightness: 1.6,
 *       opacity: 1,
 *       pulseSpeed: 1.1,
 *       noiseStrength: 0.02,
 *       blendMode: 'screen',
 *       bands: 6              // fewer = faster, more = smoother taper
 *     });
 *   </script>
 */
(function (global) {
  function hexToRgb(hex) {
    var clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(function (c) { return c + c; }).join('');
    }
    var bigint = parseInt(clean, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }

  function lerpColor(hexA, hexB, t) {
    var a = hexToRgb(hexA), b = hexToRgb(hexB);
    return {
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t
    };
  }

  function rgbString(c, brightness, alpha) {
    var clamp = function (v) { return Math.max(0, Math.min(255, Math.round(v * brightness))); };
    return 'rgba(' + clamp(c.r) + ',' + clamp(c.g) + ',' + clamp(c.b) + ',' + alpha + ')';
  }

  function init(container, opts) {
    opts = opts || {};
    var color = opts.color || '#95f00c';
    var secondaryColor = opts.secondaryColor || '#f6dd03';
    var trailWidth = opts.trailWidth != null ? opts.trailWidth : 7;
    var trailLifetime = opts.trailLifetime != null ? opts.trailLifetime : 550; // ms
    var followSpeed = opts.followSpeed != null ? opts.followSpeed : 0.35;
    var glowIntensity = opts.glowIntensity != null ? opts.glowIntensity : 1.8;
    var glowSpread = opts.glowSpread != null ? opts.glowSpread : 1;
    var hotspot = opts.hotspot != null ? opts.hotspot : 0.65;
    var brightness = opts.brightness != null ? opts.brightness : 1.6;
    var opacity = opts.opacity != null ? opts.opacity : 1;
    var pulseSpeed = opts.pulseSpeed != null ? opts.pulseSpeed : 1.1;
    var noiseStrength = opts.noiseStrength != null ? opts.noiseStrength : 0.02;
    var blendMode = opts.blendMode || 'screen';
    var bands = opts.bands != null ? opts.bands : 6; // draw calls per frame; lower = faster
    var fullPage = !!opts.fullPage;

    if (fullPage) {
      container.style.position = 'fixed';
      container.style.inset = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.zIndex = opts.zIndex || '9999';
      container.style.pointerEvents = 'none';
      container.style.overflow = 'hidden';
    } else {
      container.style.position = container.style.position || 'relative';
      container.style.overflow = 'hidden';
    }
    container.style.cursor = fullPage ? '' : 'none';

    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function resize() {
      var w, h;
      if (fullPage) {
        w = window.innerWidth;
        h = window.innerHeight;
      } else {
        var rect = container.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
      }
      var dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    var ro = null;
    if (fullPage) {
      window.addEventListener('resize', resize);
    } else {
      ro = new ResizeObserver(resize);
      ro.observe(container);
    }

    var target = { x: 0, y: 0 };
    var current = { x: 0, y: 0 };
    var trail = []; // { x, y, t } - t is the timestamp it was created
    var hasPointer = false;
    var startTime = performance.now();

    function handleMove(e) {
      var x, y;
      if (fullPage) {
        x = e.clientX;
        y = e.clientY;
      } else {
        var rect = container.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      target.x = x;
      target.y = y;
      if (!hasPointer) {
        current.x = target.x;
        current.y = target.y;
        hasPointer = true;
      }
    }
    function handleLeave() { hasPointer = false; }

    function handleTouch(e) {
      if (!e.touches || !e.touches.length) return;
      var t = e.touches[0];
      handleMove({ clientX: t.clientX, clientY: t.clientY });
    }
    function handleTouchEnd() { hasPointer = false; }

    var moveTarget = fullPage ? window : container;
    moveTarget.addEventListener('mousemove', handleMove);
    moveTarget.addEventListener('touchstart', handleTouch, { passive: true });
    moveTarget.addEventListener('touchmove', handleTouch, { passive: true });
    moveTarget.addEventListener('touchend', handleTouchEnd);
    moveTarget.addEventListener('touchcancel', handleTouchEnd);
    if (!fullPage) container.addEventListener('mouseenter', handleMove);
    if (!fullPage) container.addEventListener('mouseleave', handleLeave);

    var rafId;
    var lastPointPos = null;

    function tick() {
      var now = performance.now();
      var w, h;
      if (fullPage) {
        w = window.innerWidth;
        h = window.innerHeight;
      } else {
        var rect = container.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
      }
      ctx.clearRect(0, 0, w, h);

      if (hasPointer) {
        current.x += (target.x - current.x) * followSpeed;
        current.y += (target.y - current.y) * followSpeed;

        // only add a new trail point if the cursor actually moved a bit -
        // this is what lets the trail run out and disappear when idle
        var movedEnough =
          !lastPointPos ||
          Math.hypot(current.x - lastPointPos.x, current.y - lastPointPos.y) > 1.2;

        if (movedEnough) {
          var nx = current.x + (Math.random() - 0.5) * noiseStrength * 40;
          var ny = current.y + (Math.random() - 0.5) * noiseStrength * 40;
          trail.unshift({ x: nx, y: ny, t: now });
          lastPointPos = { x: current.x, y: current.y };
        }
      }

      // drop points once they've aged past their lifetime - this is what
      // makes the trail fade / shrink away on its own
      while (trail.length && now - trail[trail.length - 1].t > trailLifetime) {
        trail.pop();
      }

      if (trail.length > 1) {
        var pulse = 0.85 + 0.15 * Math.sin(((now - startTime) / 1000) * pulseSpeed * Math.PI * 2);
        ctx.globalCompositeOperation = blendMode;

        var n = trail.length;
        var coreMixed = lerpColor(color, secondaryColor, hotspot);
        var tailMixed = lerpColor(color, secondaryColor, 1);

        // build a tapered ribbon: an offset polygon around the path whose
        // half-width shrinks from the head down to ~0 at the tail, so the
        // narrowing is real geometry (not an illusion from overlapping blur)
        var leftPts = new Array(n);
        var rightPts = new Array(n);
        for (var i = 0; i < n; i++) {
          var p = trail[i];
          var pPrev = trail[i - 1] || p;
          var pNext = trail[i + 1] || p;
          var dx = pNext.x - pPrev.x;
          var dy = pNext.y - pPrev.y;
          var segLen = Math.hypot(dx, dy) || 1;
          var nx = -dy / segLen;
          var ny = dx / segLen;
          var ageFrac = 1 - i / (n - 1); // 1 at head, 0 at tail
          var halfW = (trailWidth * Math.pow(ageFrac, 1.7)) / 2;
          leftPts[i] = { x: p.x + nx * halfW, y: p.y + ny * halfW };
          rightPts[i] = { x: p.x - nx * halfW, y: p.y - ny * halfW };
        }

        ctx.beginPath();
        ctx.moveTo(leftPts[0].x, leftPts[0].y);
        for (var i2 = 1; i2 < n; i2++) ctx.lineTo(leftPts[i2].x, leftPts[i2].y);
        for (var i3 = n - 1; i3 >= 0; i3--) ctx.lineTo(rightPts[i3].x, rightPts[i3].y);
        ctx.closePath();

        var grad = ctx.createLinearGradient(trail[0].x, trail[0].y, trail[n - 1].x, trail[n - 1].y);
        grad.addColorStop(0, rgbString(coreMixed, brightness, opacity * pulse));
        grad.addColorStop(0.6, rgbString(tailMixed, brightness, opacity * pulse * 0.5));
        grad.addColorStop(1, rgbString(tailMixed, brightness, 0));

        // soft glow pass - a single blurred fill instead of many blurred strokes
        ctx.save();
        ctx.filter = 'blur(' + Math.max(0.5, glowIntensity * glowSpread * 2) + 'px)';
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // crisp pass on top so the taper itself stays sharp and visible
        ctx.fillStyle = grad;
        ctx.fill();

        // bright core dot right at the cursor
        var head = trail[0];
        var coreAlpha = opacity * pulse;
        ctx.shadowColor = rgbString(coreMixed, brightness, coreAlpha);
        ctx.shadowBlur = glowIntensity * glowSpread * trailWidth * 1.4 * pulse;
        ctx.fillStyle = rgbString(coreMixed, brightness, coreAlpha);
        ctx.beginPath();
        ctx.arc(head.x, head.y, Math.max(1, trailWidth * 0.85), 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'source-over';
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return {
      destroy: function () {
        cancelAnimationFrame(rafId);
        if (ro) ro.disconnect();
        if (fullPage) window.removeEventListener('resize', resize);
        moveTarget.removeEventListener('mousemove', handleMove);
        moveTarget.removeEventListener('touchstart', handleTouch);
        moveTarget.removeEventListener('touchmove', handleTouch);
        moveTarget.removeEventListener('touchend', handleTouchEnd);
        moveTarget.removeEventListener('touchcancel', handleTouchEnd);
        if (!fullPage) {
          container.removeEventListener('mouseenter', handleMove);
          container.removeEventListener('mouseleave', handleLeave);
        }
        container.removeChild(canvas);
      }
    };
  }

  global.GlowCursor = { init: init };
})(window);
