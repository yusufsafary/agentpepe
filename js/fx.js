(function () {
  // Ambient pond background: slowly rising green bubbles and small
  // gold coins with a $ glyph. Decorative only, sits behind content.
  var canvas = document.getElementById("fx-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var W = 0, H = 0, parts = [], running = true;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn(anywhere) {
    var coin = Math.random() < 0.32;
    return {
      coin: coin,
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 30 + Math.random() * 60,
      r: coin ? 9 + Math.random() * 9 : 3 + Math.random() * 9,
      speed: 0.25 + Math.random() * 0.7,
      drift: Math.random() * Math.PI * 2,
      driftSpeed: 0.004 + Math.random() * 0.01,
      sway: 8 + Math.random() * 22,
      alpha: coin ? 0.28 + Math.random() * 0.22 : 0.14 + Math.random() * 0.24
    };
  }

  function init() {
    resize();
    parts = [];
    var count = Math.max(14, Math.min(30, Math.floor(W / 55)));
    for (var i = 0; i < count; i++) parts.push(spawn(true));
  }

  function drawCoin(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 185, 33, " + p.alpha + ")";
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "rgba(12, 43, 16, " + p.alpha * 0.8 + ")";
    ctx.stroke();
    ctx.fillStyle = "rgba(12, 43, 16, " + Math.min(1, p.alpha + 0.18) + ")";
    ctx.font = "800 " + Math.round(p.r * 1.15) + "px 'Baloo 2', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", p.x, p.y + 1);
  }

  function drawBubble(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(10, 61, 18, " + p.alpha + ")";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, " + p.alpha * 0.9 + ")";
    ctx.fill();
  }

  function tick() {
    if (running) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.drift += p.driftSpeed;
        p.y -= p.speed;
        var x = p.x + Math.sin(p.drift) * p.sway * 0.3;
        var oldX = p.x;
        p.x = x;
        if (p.coin) drawCoin(p); else drawBubble(p);
        p.x = oldX;
        if (p.y < -34) parts[i] = spawn(false);
      }
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
  });
  window.addEventListener("resize", init);
  init();
  requestAnimationFrame(tick);
})();
