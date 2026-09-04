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

    container.style.position = container.style.position || 'relative';
    container.style.overflow = 'hidden';
    container.style.cursor = 'none';

    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function resize() {
      var rect = container.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    var ro = new ResizeObserver(resize);
    ro.observe(container);

    var target = { x: 0, y: 0 };
    var current = { x: 0, y: 0 };
    var trail = []; // { x, y, t } - t is the timestamp it was created
    var hasPointer = false;
    var startTime = performance.now();

    function handleMove(e) {
      var rect = container.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      if (!hasPointer) {
        current.x = target.x;
        current.y = target.y;
        hasPointer = true;
      }
    }
    function handleLeave() { hasPointer = false; }

    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseenter', handleMove);
    container.addEventListener('mouseleave', handleLeave);

    var rafId;
    var lastPointPos = null;

    function tick() {
      var now = performance.now();
      var rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

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

          var w = trailWidth * (0.06 + Math.pow(headAgeFrac, 1.6) * 1.3);
          var segAlpha = opacity * (0.12 + headAgeFrac * 0.55) * pulse;

          var mixed = lerpColor(color, secondaryColor, Math.min(1, (1 - headAgeFrac) / Math.max(hotspot, 0.05)));

          ctx.strokeStyle = rgbString(mixed, brightness, segAlpha);
          ctx.shadowColor = rgbString(mixed, brightness, Math.min(1, segAlpha * 1.3));
          ctx.shadowBlur = glowIntensity * glowSpread * (w + 4) * pulse;
          ctx.lineWidth = w;

          ctx.beginPath();
          for (var i = 0; i < count && i < trail.length; i++) {
            var p = trail[i];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
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
        ctx.arc(head.x, head.y, Math.max(1, trailWidth * 0.68), 0, Math.PI * 2);
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
        ro.disconnect();
        container.removeEventListener('mousemove', handleMove);
        container.removeEventListener('mouseenter', handleMove);
        container.removeEventListener('mouseleave', handleLeave);
        container.removeChild(canvas);
      }
    };
  }

  global.GlowCursor = { init: init };
})(window);
