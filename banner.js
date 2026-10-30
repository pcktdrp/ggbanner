(() => {
  "use strict";

  const BANNER_ID = "ggbanner-monitoring-notice";
  const HIDDEN_CLASS = "ggbanner--hidden";
  const SCROLL_THRESHOLD = 8;

  function addNotice() {
    if (!document.body || document.getElementById(BANNER_ID)) {
      return;
    }

    const banner = document.createElement("aside");
    banner.id = BANNER_ID;
    banner.setAttribute("role", "note");
    banner.setAttribute("aria-label", "District web activity notice");

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
      banner.classList.add(HIDDEN_CLASS);
    });

    window.addEventListener(
      "scroll",
      () => {
        if (manuallyDismissed) {
          return;
        }

        const currentScrollY = Math.max(0, window.scrollY);
        const difference = currentScrollY - lastScrollY;

        if (currentScrollY <= 0 || difference < -SCROLL_THRESHOLD) {
          banner.classList.remove(HIDDEN_CLASS);
        } else if (difference > SCROLL_THRESHOLD) {
          banner.classList.add(HIDDEN_CLASS);
        }

        lastScrollY = currentScrollY;
      },
      { passive: true }
    );

    banner.append(label, message, hideButton);
    document.body.insertBefore(banner, document.body.firstChild);
  }

  addNotice();
})();
