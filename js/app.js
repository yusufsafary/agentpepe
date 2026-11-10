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
    RPCS: ["https://bsc-dataseed.binance.org", "https://bsc-dataseed-public.bnbchain.org"]
  };

  function $(id) { return document.getElementById(id); }

  function short(addr) {
    return addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";
  }

  function fillContracts() {
    if (CONFIG.NFT) $("c-nft").textContent = CONFIG.NFT;
    if (CONFIG.TOKEN) $("c-token").textContent = CONFIG.TOKEN;
    if (CONFIG.CLAIM) $("c-claim").textContent = CONFIG.CLAIM;
  }

  async function readMinted() {
    if (!CONFIG.NFT) return; // no contract set, board stays in soon mode
    var calls = [
      { jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: CONFIG.NFT, data: "0xa2309ff8" }, "latest"] }, // totalMinted()
      { jsonrpc: "2.0", id: 2, method: "eth_call", params: [{ to: CONFIG.NFT, data: "0x24bbd049" }, "latest"] }  // mintOpen()
    ];
    for (var i = 0; i < CONFIG.RPCS.length; i++) {
      try {
        var r = await fetch(CONFIG.RPCS[i], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(calls)
        });
        var j = await r.json();
        if (!j || !Array.isArray(j)) continue;
        var mintedRes = j.find(function (x) { return x.id === 1; });
        var openRes = j.find(function (x) { return x.id === 2; });
        if (mintedRes && mintedRes.result) {
          var n = parseInt(mintedRes.result, 16);
          if ($("b-minted")) $("b-minted").textContent = n.toLocaleString("en-US");
          if ($("b-left")) $("b-left").textContent = (CONFIG.SUPPLY - n).toLocaleString("en-US");
          var open = openRes && openRes.result && parseInt(openRes.result, 16) === 1;
          if (open) {
            if ($("b-status")) $("b-status").textContent = n >= CONFIG.SUPPLY ? "SOLD OUT" : "LIVE";
            if ($("b-note")) $("b-note").textContent = "Mint is live. Send your Binance agent the prompt below and grab your frog.";
          } else {
            if ($("b-status")) $("b-status").textContent = "SOON";
            if ($("b-note")) $("b-note").textContent = "Mint is not open yet. Contracts are deployed. Watch this page and get your agent ready.";
          }
          return;
        }
      } catch (e) {}
    }
  }

  var cbtn = $("copy-btn");
  if (cbtn) cbtn.addEventListener("click", function () {
    var t = $("agent-prompt").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t);
    cbtn.textContent = "Copied";
    setTimeout(function () { cbtn.textContent = "Copy"; }, 1600);
  });

  fillContracts();
  readMinted();
  setInterval(readMinted, 30000);
})();
