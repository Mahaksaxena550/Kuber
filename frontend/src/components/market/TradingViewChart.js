import React, { useEffect, useRef, memo } from "react";

function TradingViewChart({ symbol = "AAPL" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=${symbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=MASimple%40tv-basicstudies&theme=light&style=1&timezone=Asia%2FKolkata&withdateranges=1&showpopupbutton=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart`;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.allowFullscreen = true;

    container.appendChild(iframe);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      style={{ height: "600px", width: "100%" }}
    />
  );
}

export default memo(TradingViewChart);