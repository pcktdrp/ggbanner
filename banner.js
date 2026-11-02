(() => {
  "use strict";

  // Use a built-in element so page-registered custom elements cannot run here.
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "closed" });
  const HIDDEN_CLASS = "ggbanner--hidden";
  const SCROLL_THRESHOLD = 8;

  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
    }

    #notice {
      all: initial;
      box-sizing: border-box;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: max-content;
      max-width: calc(100vw - 24px);
      min-height: 26px;
      margin: 0;
      padding: 2px 9px 2px 12px;
      border: 1px solid #cbd3dd;
      border-radius: 999px;
      background: #eef1f5;
      color: #273548;
      font: 12px/1.35 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      text-align: center;
      letter-spacing: normal;
      text-transform: none;
      box-shadow: 0 2px 8px rgb(20 32 48 / 14%);
      transition: transform 180ms ease;
      pointer-events: none;
    }

    #notice.ggbanner--hidden {
      transform: translateY(-160%);
    }

    #notice *,
    #notice *::before,
    #notice *::after {
      box-sizing: border-box;
    }

    .ggbanner__logo {
      display: block;
      flex: 0 0 108px;
      width: 108px;
      height: 22px;
      object-fit: contain;
      object-position: center;
    }

    .ggbanner__message {
      display: flex;
      flex: 0 1 auto;
      align-items: center;
      align-self: center;
      min-height: 22px;
      color: #273548;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.2;
      overflow-wrap: anywhere;
      transform: translateY(2px);
    }

    .ggbanner__hide {
      all: initial;
      box-sizing: border-box;
      position: static;
      display: inline-flex;
      align-self: center;
      flex: 0 0 22px;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 50%;
      color: #44566c;
      background: transparent;
      font: 20px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1;
      transform: translateY(2px);
      cursor: pointer;
      pointer-events: auto;
    }

    .ggbanner__hide:hover {
      background: #dce2e9;
    }

    .ggbanner__hide:focus-visible {
      outline: 2px solid #315f9b;
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      #notice {
        transition: none;
      }
    }

    @media (max-width: 420px) {
      #notice {
        gap: 8px;
        padding: 2px 7px 2px 10px;
      }

      .ggbanner__logo {
        flex-basis: 92px;
        width: 92px;
        height: 22px;
      }
    }
  `;

  const notice = document.createElement("aside");
  notice.id = "notice";
  notice.setAttribute("role", "note");
  notice.setAttribute("aria-label", "District web activity notice");

  const logo = document.createElement("img");
  logo.className = "ggbanner__logo";
  logo.alt = "District notice";
  logo.draggable = false;
  logo.src = chrome.runtime.getURL("logo.png");

  const message = document.createElement("span");
  message.className = "ggbanner__message";
  message.textContent =
    "Web activity may be monitored and filtered by GoGuardian.";

  const hideButton = document.createElement("button");
  hideButton.className = "ggbanner__hide";
  hideButton.type = "button";
  hideButton.setAttribute("aria-label", "Hide district notice");
  hideButton.title = "Hide notice";
  hideButton.textContent = "×";

  let manuallyDismissed = false;
  let lastScrollY = window.scrollY;

  hideButton.addEventListener("click", () => {
    manuallyDismissed = true;
    notice.classList.add(HIDDEN_CLASS);
  });

  window.addEventListener(
    "scroll",
    () => {
      if (manuallyDismissed) {
        return;
      }

      const currentScrollY = Math.max(0, window.scrollY);
      const difference = currentScrollY - lastScrollY;

      if (currentScrollY <= 0) {
        notice.classList.remove(HIDDEN_CLASS);
      } else if (difference > SCROLL_THRESHOLD) {
        notice.classList.add(HIDDEN_CLASS);
      }

      lastScrollY = currentScrollY;
    },
    { passive: true }
  );

  notice.append(logo, message, hideButton);
  shadow.append(style, notice);

  // Inline important declarations reduce interference from page styles.
  // They cannot make a content script fully tamper-proof against its host page.
  const hostStyles = {
    all: "initial",
    position: "fixed",
    top: "2px",
    left: "50%",
    "z-index": "2147483647",
    display: "block",
    visibility: "visible",
    opacity: "1",
    "content-visibility": "visible",
    "clip-path": "none",
    filter: "none",
    width: "max-content",
    height: "auto",
    margin: "0",
    padding: "0",
    border: "0",
    background: "transparent",
    transform: "translateX(-50%)",
    "pointer-events": "none"
  };

  function enforceHostState() {
    // These attributes have no legitimate role on the extension-owned host.
    for (const attribute of ["hidden", "inert", "aria-hidden", "class"]) {
      if (host.hasAttribute(attribute)) {
        host.removeAttribute(attribute);
      }
    }

    const approvedProperties = new Set(Object.keys(hostStyles));

    for (let index = host.style.length - 1; index >= 0; index -= 1) {
      const property = host.style.item(index);
      if (!approvedProperties.has(property)) {
        host.style.removeProperty(property);
      }
    }

    for (const [property, value] of Object.entries(hostStyles)) {
      if (
        host.style.getPropertyValue(property) !== value ||
        host.style.getPropertyPriority(property) !== "important"
      ) {
        host.style.setProperty(property, value, "important");
      }
    }
  }

  function ensureHost() {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    enforceHostState();

    if (!host.isConnected || host.parentNode !== root) {
      root.append(host);
    }
  }

  ensureHost();

  let observedRoot = null;

  const rootObserver = new MutationObserver((records) => {
    if (
      !host.isConnected ||
      host.parentNode !== document.documentElement ||
      records.some((record) => record.target === host)
    ) {
      ensureHost();
    }
  });

  function observeCurrentRoot() {
    const currentRoot = document.documentElement;
    if (!currentRoot || currentRoot === observedRoot) {
      return;
    }

    rootObserver.disconnect();
    observedRoot = currentRoot;
    rootObserver.observe(currentRoot, {
      childList: true,
      subtree: true
    });
    rootObserver.observe(host, {
      attributes: true,
      attributeFilter: ["style", "hidden", "inert", "aria-hidden", "class"]
    });
  }

  // Detect documentElement replacement and reconnect the host to the new root.
  const documentObserver = new MutationObserver(() => {
    ensureHost();
    observeCurrentRoot();
  });

  documentObserver.observe(document, { childList: true });
  observeCurrentRoot();
})();