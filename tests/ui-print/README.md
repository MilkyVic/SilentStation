# UI-only card and A4 print regressions

This suite builds a **separate demo/test artefact**. The synthetic fixture entry
is not an input to `npm run build`; no production route or API is added.
Chromium uses a new isolated profile, blocks non-loopback requests and does not
use a DB, credentials, external font service, email or personal browser profile.

Use Node 22 and install the pinned lockfile dependencies as usual. Keep the test
browser in this project's ignored directory (do not change global config):

```sh
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.acceptance/chromium"
npx --no-install playwright install chromium
npm run test:ui-print
```

The preview server binds only to `127.0.0.1:4186` and stops after the suite.
The tests cover all audience labels, open/closed and hover/focus/disabled at
320/390/768/1280 px, the actual catalogue/management/research pages, retained
alpha utilities, the body-level print portal, accessibility hiding, Escape,
focus return, font waiting, pending-print cancellation, logout cleanup and
unsupported/historical definitions. Traces and response/credential logs are off.

Outputs are ignored, not bundled or committed:
- `.acceptance/ui-print-evidence`: screenshots and JSON test report.
- `output/pdf`: blank, **synthetic response**, historical and actual-app PDFs.
- `.acceptance/pdf-review`: public definition JSON, rendered pages and checks.

The PDFs are created by Chromium using print media and `preferCSSPageSize`.
For postflight checks/rendering, use Python with `pdfplumber` and Poppler:

```sh
python3 tests/ui-print/verify-pdfs.py \
  --definition .acceptance/pdf-review/definition.json --render
```

This checks A4, all 155 distinct question labels, all 10 sections, margins,
complete table rows, repeated table headers, intact question headings, long
answer continuation and historical provenance. Inspect **every rendered page**
after changes: programmatic checks do not replace visual review. Native printer
settings can override page size/margins; select A4, 100% scale and disable the
browser's own URL/date headers. No PDF export endpoint is added.
