(function () {
  // CONFIG: contract addresses (deployed, mint still closed).
  // The board reads totalMinted and mintOpen from chain every 30
  // seconds. It shows SOON while mintOpen is false and switches to
  // live mode only when mintOpen is true.
  var CONFIG = {
    NFT: "0xA34C9D34b2Ee93b8059d0ED5302ae595c446423d",        // AgentPepe NFT contract address
    TOKEN: "0x95805acAE9125Caf9E26Bb08ca272e6D9dBc3F9A",      // $APEPE token contract address
    CLAIM: "0x49e6bD4C0c7728c947F899F5e21a7A1D3B6e8584",      // claim contract address
    SUPPLY: 6666,
    RPCS: ["https://bsc-rpc.publicnode.com", "https://bsc-dataseed.bnbchain.org", "https://bsc-dataseed.binance.org", "https://bsc-dataseed1.binance.org"]
  };

  function $(id) { return document.getElementById(id); }

  function short(addr) {
    return addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";
  }


  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tweens = {};
  function setNum(el, to) {
    if (!el) return;
    if (reduceMotion) { el.textContent = to.toLocaleString("en-US"); return; }
    var from = parseInt((el.textContent || "").replace(/[^0-9]/g, ""), 10);
    if (isNaN(from)) from = 0;
    var key = el.id || Math.random();
    if (tweens[key]) cancelAnimationFrame(tweens[key]);
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 650);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e).toLocaleString("en-US");
      if (p < 1) tweens[key] = requestAnimationFrame(step);
    }
    tweens[key] = requestAnimationFrame(step);
  }
  function setSnap(n) {
    var next = (Math.floor(n / 500) + 1) * 500;
    var num = Math.floor(n / 500) + 1;
    var fill = $("snap-fill"), lab = $("snap-label"), cnt = $("snap-count");
    if (fill) fill.style.width = Math.min(100, (n % 500) / 5) + "%";
    if (lab) lab.textContent = "Snapshot Nº " + num + " at " + next.toLocaleString("en-US") + " mints";
    if (cnt) cnt.textContent = n.toLocaleString("en-US") + " / " + next.toLocaleString("en-US");
  }

  function fillContracts() {
    if (CONFIG.NFT) $("c-nft").textContent = CONFIG.NFT;
    if (CONFIG.TOKEN) $("c-token").textContent = CONFIG.TOKEN;
    if (CONFIG.CLAIM) $("c-claim").textContent = CONFIG.CLAIM;
  }

  function raceCalls(calls, onOk) {
    var done = false;
    CONFIG.RPCS.forEach(function (url) {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calls)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (done || !j || !Array.isArray(j)) return;
        var first = j.find(function (x) { return x.id === 1; });
        if (first && first.result && first.result !== "0x") { done = true; onOk(j); }
      }).catch(function () {});
    });
  }

  function readMinted() {
    if (!CONFIG.NFT) return;
    var calls = [
      { jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: CONFIG.NFT, data: "0xa2309ff8" }, "latest"] },
      { jsonrpc: "2.0", id: 2, method: "eth_call", params: [{ to: CONFIG.NFT, data: "0x24bbd049" }, "latest"] }
    ];
    raceCalls(calls, function (j) {
      var mintedRes = j.find(function (x) { return x.id === 1; });
      var openRes = j.find(function (x) { return x.id === 2; });
      var n = parseInt(mintedRes.result, 16);
      setNum($("b-minted"), n); setSnap(n);
      setNum($("b-left"), CONFIG.SUPPLY - n);
      var open = openRes && openRes.result && parseInt(openRes.result, 16) === 1;
      if (open) {
        if ($("b-status")) $("b-status").textContent = n >= CONFIG.SUPPLY ? "SOLD OUT" : "LIVE";
        if ($("b-note")) $("b-note").textContent = "Mint is live. Send your Binance agent the prompt below and grab your frog.";
      } else {
        if ($("b-status")) $("b-status").textContent = "SOON";
        if ($("b-note")) $("b-note").textContent = "Mint is not open yet. Contracts are deployed. Watch this page and get your agent ready.";
      }
    });
  }

  var cbtn2 = $("copy-btn-claim");
  if (cbtn2) cbtn2.addEventListener("click", function () {
    var t = $("claim-prompt").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t);
    cbtn2.textContent = "Copied";
    setTimeout(function () { cbtn2.textContent = "Copy"; }, 1600);
  });

  var cbtn = $("copy-btn");
  if (cbtn) cbtn.addEventListener("click", function () {
    var t = $("agent-prompt").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t);
    cbtn.textContent = "Copied";
    setTimeout(function () { cbtn.textContent = "Copy"; }, 1600);
  });


  function readClaim() {
    if (!CONFIG.CLAIM) return;
    var calls = [
      { jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: CONFIG.CLAIM, data: "0xd54ad2a1" }, "latest"] },
      { jsonrpc: "2.0", id: 2, method: "eth_call", params: [{ to: CONFIG.CLAIM, data: "0x4b8bcb58" }, "latest"] }
    ];
    raceCalls(calls, function (j) {
      var cRes = j.find(function (x) { return x.id === 1; });
      var oRes = j.find(function (x) { return x.id === 2; });
      if (cRes && cRes.result) setNum($("cl-claimed"), parseInt(cRes.result, 16));
      if (oRes && oRes.result && $("cl-status")) $("cl-status").textContent = parseInt(oRes.result, 16) === 1 ? "OPEN" : "CLOSED";
    });
  }
  fillContracts();
  readMinted();
  readClaim();
  setInterval(readMinted, 30000);
  setInterval(readClaim, 30000);
})();

/* reveal on scroll (v3) */
(function () {
  if (!("IntersectionObserver" in window)) return;
  var els = document.querySelectorAll(".step, .fact, .strip-card, .prompt-box, .faq details, .section h2");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
  els.forEach(function (el, i) {
    el.classList.add("rv");
    if (el.classList.contains("step") || el.classList.contains("fact")) {
      el.style.transitionDelay = (i % 4) * 55 + "ms";
    }
    io.observe(el);
  });
})();
