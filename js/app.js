(function () {
  // CONFIG: fill the three contract addresses after deployment.
  // While NFT is empty the board stays in "MINT OPENS SOON" mode and
  // no chain reads happen. Once NFT is set, the board reads totalMinted
  // from chain every 30 seconds and switches to live mode.
  var CONFIG = {
    NFT: "",        // TO BE FILLED: AgentPepe NFT contract address
    TOKEN: "",      // TO BE FILLED: $APEPE token contract address
    CLAIM: "",      // TO BE FILLED: claim contract address
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
    if (!CONFIG.NFT) return; // mint not live yet, board stays in soon mode
    var data = "0xa2309ff8"; // totalMinted()
    for (var i = 0; i < CONFIG.RPCS.length; i++) {
      try {
        var r = await fetch(CONFIG.RPCS[i], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: CONFIG.NFT, data: data }, "latest"] })
        });
        var j = await r.json();
        if (j && j.result) {
          var n = parseInt(j.result, 16);
          if ($("b-minted")) $("b-minted").textContent = n.toLocaleString("en-US");
          if ($("b-left")) $("b-left").textContent = (CONFIG.SUPPLY - n).toLocaleString("en-US");
          if ($("b-status")) $("b-status").textContent = n >= CONFIG.SUPPLY ? "SOLD OUT" : "LIVE";
          if ($("b-note")) $("b-note").textContent = "Mint is live. Send your Binance agent the prompt below and grab your frog.";
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
