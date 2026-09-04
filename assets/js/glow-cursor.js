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
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // draw in a handful of bands (back to front): each band strokes a
        // shrinking prefix of the trail (the newest points) with a bigger
        // width and higher opacity, approximating a tapered glow without
        // paying for one shadowBlur call per point.
        for (var band = bands - 1; band >= 0; band--) {
          var bandFrac = band / (bands - 1); // 1 = whole trail (tail), 0 = just the head
          var count = Math.max(2, Math.round(trail.length * (1 - bandFrac * 0.85)));
          var headAgeFrac = 1 - bandFrac; // 0..1, 1 = nearest the head

          var w = trailWidth * (0.008 + Math.pow(headAgeFrac, 3) * 1.35);
          var segAlpha = opacity * (0.12 + headAgeFrac * 0.55) * pulse;

          var mixed = lerpColor(color, secondaryColor, Math.min(1, (1 - headAgeFrac) / Math.max(hotspot, 0.05)));

          ctx.strokeStyle = rgbString(mixed, brightness, segAlpha);
          ctx.shadowColor = rgbString(mixed, brightness, Math.min(1, segAlpha * 1.3));
          ctx.shadowBlur = glowIntensity * glowSpread * w * pulse;
          ctx.lineWidth = w;

          ctx.beginPath();
          var pointCount = Math.min(count, trail.length);
          if (pointCount === 2) {
            ctx.moveTo(trail[0].x, trail[0].y);
            ctx.lineTo(trail[1].x, trail[1].y);
          } else if (pointCount > 2) {
            ctx.moveTo(trail[0].x, trail[0].y);
            for (var i = 0; i < pointCount - 2; i++) {
              var p1 = trail[i];
              var p2 = trail[i + 1];
              var midX = (p1.x + p2.x) / 2;
              var midY = (p1.y + p2.y) / 2;
              ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
            }
            var last = trail[pointCount - 1];
            var prev = trail[pointCount - 2];
            ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
          }
          ctx.stroke();
        }

        // bright core dot right at the cursor
        var head = trail[0];
        var coreMixed = lerpColor(color, secondaryColor, hotspot);
        var coreAlpha = opacity * pulse;
        ctx.shadowColor = rgbString(coreMixed, brightness, coreAlpha);
        ctx.shadowBlur = glowIntensity * glowSpread * trailWidth * 2.2 * pulse;
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
