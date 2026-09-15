# Bruno AC Estimating (PWA)

**Copyright © 2026 Bruno AC Services LLC. All rights reserved.**

Offline HVAC / air-conditioning contractor estimating Progressive Web App.
Method A quoting (`sales = cost × (1+OH)/(1−profit)`), catalog, labor & equip,
Workers, T&M, P&L, Change Orders, Dispatch, and Texas HVAC informational Reference.

**Live (GitHub Pages):** https://kot0070.github.io/bruno-ac-pwa/

## Install (iPhone)

See [INSTALL_IOS.md](./INSTALL_IOS.md). Open the Pages HTTPS URL in Safari → Share → Add to Home Screen.

## Local open

Serve this folder over HTTPS (required for installable PWA). `index.html` alone works for desktop use in any browser.

## Data isolation

Uses `bruno-ac-*` localStorage keys and SW cache `bruno-ac-v4` — safe side-by-side with other Bruno trade apps on the same device. Export envelopes include `product: "bruno-ac"`; cross-product imports are rejected.

## Branding

Central `BRAND` constants in `index.html` (`legalName`, `copyrightLine`, `copyrightFoot`, app title, storage keys, export prefix, accent). Shop seed / About / footer copyright use **Bruno AC Services LLC**; working app title stays **Bruno AC Estimating**.
