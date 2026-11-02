(() => {
  "use strict";

  const HOST_TAG = "ggbanner-notice-host";
  const HIDDEN_CLASS = "ggbanner--hidden";
  const SCROLL_THRESHOLD = 8;

  // The closed shadow root keeps page styles and ordinary page scripts from
  // reading or rewriting the notice's internal UI.
  const host = document.createElement(HOST_TAG);
  const shadow = host.attachShadow({ mode: "closed" });

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
    }

    #notice {
      pointer-events: auto;
    }

    #notice.ggbanner--hidden {
      transform: translateY(-160%);
      pointer-events: none;
    }

    #notice *,
    #notice *::before,
    #notice *::after {
      box-sizing: border-box;
    }

    .ggbanner__label {
      display: inline-flex;
      align-items: center;
      align-self: center;
      height: 22px;
      color: #44566c;
      font-size: 10px;
      font-weight: 700;
      line-height: 22px;
      letter-spacing: 0.07em;
      white-space: nowrap;
    }

    .ggbanner__message {
      display: inline-flex;
      align-items: center;
      align-self: center;
      min-height: 22px;
      color: #273548;
      font-size: 12px;
      font-weight: 400;
      line-height: 22px;
      overflow-wrap: anywhere;
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
      line-height: 22px;
      cursor: pointer;
      transform: translateY(-1px);
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
    }
  `;

  const notice = document.createElement("aside");
  notice.id = "notice";
  notice.setAttribute("role", "note");
  notice.setAttribute("aria-label", "District web activity notice");

  const label = document.createElement("span");
  label.className = "ggbanner__label";
  label.textContent = "DISTRICT NOTICE";

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

  notice.append(label, message, hideButton);
  shadow.append(style, notice);

  // Important inline styles make ordinary page CSS less able to reposition
  // or conceal the host. The page still cannot access the closed shadow root.
  const hostStyles = {
    all: "initial",
    position: "fixed",
    top: "2px",
    left: "50%",
    "z-index": "2147483647",
    display: "block",
    width: "max-content",
    height: "auto",
    margin: "0",
    padding: "0",
    border: "0",
    background: "transparent",
    transform: "translateX(-50%)",
    "pointer-events": "none"
  };

  function enforceHostStyles() {
    const approvedProperties = new Set(Object.keys(hostStyles));

    // Remove page-injected declarations that could conceal or reposition
    // the host, while leaving the approved declarations intact.
    for (let index = host.style.length - 1; index >= 0; index -= 1) {
      const property = host.style.item(index);
      if (!approvedProperties.has(property)) {
        host.style.removeProperty(property);
      }
    }

    // Repair approved declarations only when needed. This keeps the
    // MutationObserver from creating a self-sustaining mutation loop.
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
    if (!document.documentElement) {
      return;
    }

    enforceHostStyles();

    if (
      !host.isConnected ||
      host.parentNode !== document.documentElement
    ) {
      document.documentElement.append(host);
    }
  }

  ensureHost();

  // A page can still remove the host node from the shared document. Restore
  // it if that happens, and repair host styles if page CSS/JS changes them.
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
      attributeFilter: ["style"]
    });
  }

  // Observe the Document itself so replacing document.documentElement is
  // detected; then move the subtree observer to the replacement root.
  const documentObserver = new MutationObserver(() => {
    ensureHost();
    observeCurrentRoot();
  });

  documentObserver.observe(document, { childList: true });
  observeCurrentRoot();
})();