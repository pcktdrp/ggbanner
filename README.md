# GoGuardian Web Activity Notice

A small Chrome extension that places a slim notice at the top of ordinary HTTP and HTTPS pages:

> Web activity may be monitored and filtered by GoGuardian.

The notice is informational. It does not inspect page content, collect browsing data, communicate with a server, or change GoGuardian filtering behavior.

## Design goals

- Chrome Manifest V3
- No extension permissions or background service worker
- No analytics, remote scripts, network requests, popups, animation, or sound
- Small, muted, responsive banner with accessible text
- Source files kept in the repository for review

## Local testing

1. Open **chrome://extensions** in Chrome.
2. Turn on **Developer mode**.
3. Select **Load unpacked** and choose this repository directory.
4. Open a normal HTTP or HTTPS webpage and verify the banner appears.
5. Check a narrow viewport and pages with existing sticky headers.

Browser-internal pages, the Chrome Web Store, and other restricted browser surfaces do not allow content scripts and will not show the banner.

## Packaging for self-hosted installation

**Do not deploy this source as a replacement for the currently installed extension until the new package and update manifest have been checked.** This rebuild uses a new version of the extension, and without the original private signing key its extension ID will change.

1. Keep a backup of the currently hosted CRX and update.xml.
2. In Chrome, open **chrome://extensions** and select **Pack extension**.
3. Choose this repository directory as the extension root. On the first pack, Chrome creates a private PEM key alongside the CRX.
4. Store the PEM securely offline. **Never commit or upload it to GitHub.** Reuse the same key for every future package, or the extension ID will change again.
5. Open the packed extension in Chrome and note its extension ID.
6. Update the appid in update.xml to that exact ID and the version to match manifest.json. Keep the codebase pointed at the hosted CRX URL.
7. Upload the generated CRX to the repository Pages-published location and commit the matching update.xml.
8. Verify both URLs are publicly reachable over HTTPS, then update the force-install policy in Google Admin to the new extension ID and hosted update-manifest URL.
9. Test deployment on a small pilot OU before broad rollout.

The manifest update_url must match the URL configured for the hosted update manifest. The ID in update.xml, the package signing key, and the Google Admin policy must all agree.

## Updating later

Increase the version in manifest.json, pack using the **same private key**, upload the new CRX, and update the version in update.xml. Keep the previous known-good package until the rollout is confirmed.

## Privacy and scope

This extension only displays a notice. It is not proof that monitoring is active on a particular page, and it does not replace or configure GoGuardian, Chrome management, or district filtering policies.
