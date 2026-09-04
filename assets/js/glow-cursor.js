/**
 * GlowCursor - vanilla JS glowing cursor trail effect.
 * No build step, no dependencies. Works with a plain <script> tag.
 *
 * Usage:
 *   <div id="glow-box" style="position:relative;width:100%;height:500px;background:#050610;"></div>
 *   <script src="glow-cursor.js"></script>
 *   <script>
 *     GlowCursor.init(document.getElementById('glow-box'), {
 *       color: '#95f00c',
 *       secondaryColor: '#f6dd03',
 *       trailLength: 64,
 *       trailWidth: 3,
 *       trailTaper: 0.8,
 *       followSpeed: 0.3,
 *       glowIntensity: 2.5,
 *       glowSpread: 1.2,
 *       hotspot: 0.65,
 *       brightness: 1.6,
 *       opacity: 1,
 *       pulseSpeed: 1.1,
 *       noiseStrength: 0.035,
 *       idleFade: false,
 *       idleTimeout: 700,
 *       fadeDuration: 900,
 *       blendMode: 'screen'
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
    var trailLength = opts.trailLength || 64;
    var trailWidth = opts.trailWidth || 3;
    var trailTaper = opts.trailTaper != null ? opts.trailTaper : 0.8;
    var followSpeed = opts.followSpeed != null ? opts.followSpeed : 0.3;
    var glowIntensity = opts.glowIntensity != null ? opts.glowIntensity : 2.5;
    var glowSpread = opts.glowSpread != null ? opts.glowSpread : 1.2;
    var hotspot = opts.hotspot != null ? opts.hotspot : 0.65;
    var brightness = opts.brightness != null ? opts.brightness : 1.6;
    var opacity = opts.opacity != null ? opts.opacity : 1;
    var pulseSpeed = opts.pulseSpeed != null ? opts.pulseSpeed : 1.1;
    var noiseStrength = opts.noiseStrength != null ? opts.noiseStrength : 0.035;
    var idleFade = !!opts.idleFade;
    var idleTimeout = opts.idleTimeout != null ? opts.idleTimeout : 700;
    var fadeDuration = opts.fadeDuration != null ? opts.fadeDuration : 900;
    var blendMode = opts.blendMode || 'screen';

    container.style.position = container.style.position || 'relative';
    container.style.overflow = 'hidden';
    container.style.cursor = 'none';

    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
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
    var trail = [];
    var lastMove = 0;
    var hasPointer = false;
    var startTime = performance.now();

    function handleMove(e) {
      var rect = container.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      lastMove = performance.now();
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
    function tick() {
      var now = performance.now();
      var rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (hasPointer) {
        current.x += (target.x - current.x) * followSpeed;
        current.y += (target.y - current.y) * followSpeed;
        var nx = current.x + (Math.random() - 0.5) * noiseStrength * 40;
        var ny = current.y + (Math.random() - 0.5) * noiseStrength * 40;
        trail.unshift({ x: nx, y: ny });
        if (trail.length > trailLength) trail.length = trailLength;
      }

      var idleAlpha = 1;
      if (idleFade && hasPointer) {
        var sinceMove = now - lastMove;
        if (sinceMove > idleTimeout) {
          idleAlpha = 1 - Math.min(1, (sinceMove - idleTimeout) / fadeDuration);
        }
      }

      if (trail.length > 1 && idleAlpha > 0.001) {
        var pulse = 0.85 + 0.15 * Math.sin(((now - startTime) / 1000) * pulseSpeed * Math.PI * 2);
        ctx.globalCompositeOperation = blendMode;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (var i = 0; i < trail.length - 1; i++) {
          var p0 = trail[i], p1 = trail[i + 1];
          var progress = i / trail.length;
          var w = trailWidth * Math.pow(1 - progress, 1 + trailTaper * 2);
          if (w <= 0.05) continue;

          var mixT = Math.min(1, progress / Math.max(hotspot, 0.05));
          var mixed = lerpColor(color, secondaryColor, mixT);
          var segAlpha = opacity * idleAlpha * (1 - progress) * pulse;
          if (segAlpha <= 0.005) continue;

          ctx.strokeStyle = rgbString(mixed, brightness, segAlpha);
          ctx.shadowColor = rgbString(mixed, brightness, Math.min(1, segAlpha * 1.2));
          ctx.shadowBlur = glowIntensity * glowSpread * (w + 4) * pulse;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }

        var head = trail[0];
        var coreMixed = lerpColor(color, secondaryColor, hotspot);
        var coreAlpha = opacity * idleAlpha * pulse;
        ctx.shadowColor = rgbString(coreMixed, brightness, coreAlpha);
        ctx.shadowBlur = glowIntensity * glowSpread * trailWidth * 3 * pulse;
        ctx.fillStyle = rgbString(coreMixed, brightness, coreAlpha);
        ctx.beginPath();
        ctx.arc(head.x, head.y, Math.max(1, trailWidth * 0.55), 0, Math.PI * 2);
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
