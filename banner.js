(() => {
  "use strict";

  const BANNER_ID = "ggbanner-monitoring-notice";

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

    banner.append(label, message);
    document.body.insertBefore(banner, document.body.firstChild);
  }

  addNotice();
})();
