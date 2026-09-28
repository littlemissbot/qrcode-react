# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"QRx" is a client-only QR code generator built with Create React App (react-scripts 5), React 17 and Ant Design 5. There is no backend: QR images are produced in the browser by the `qrcode` npm package and downloaded as data URLs. The production Docker image builds the app and serves `build/` from nginx (`Dockerfile`, `nginx.conf`, `docker-compose.yml`).

## Commands

```bash
npm ci                                   # install (lockfile present)
npm start                                # dev server on http://localhost:3000
npm run build                            # production build into build/
CI=true npm run build                    # what Docker/CI effectively do: ESLint warnings become errors
npx eslint src --ext .js,.jsx            # lint (config is the CRA "react-app" preset in package.json)
CI=true npx react-scripts test --watchAll=false            # run all tests once, non-interactive
CI=true npx react-scripts test --watchAll=false src/App.test.js   # run a single test file
npx react-scripts test -t "pattern"      # run tests whose name matches, in watch mode
```

Notes on current state (verified):
- `CI=true npm run build` treats every ESLint warning as an error, and Docker/CI runners set `CI`. `npm run build` and `CI=true npm run build` both compile cleanly today, so keep lint at zero warnings before pushing.
- `src/setupTests.js` mocks `window.matchMedia`, because antd's responsive grid (`Row`/`Col`) calls it on mount and jsdom does not implement it. Any test that renders antd layout components relies on that mock.
- `react-router-dom` is in `package.json` but is not used anywhere; routing is done by hand (see below).

## Architecture

Two-"page" app with hand-rolled URL state in `src/App.js`:
- `App` holds `currentPage` (`"type-selection"` | `"form"`) and `qrType`. Selecting a type calls `history.pushState` to `/form?type=<qrType>`; a `popstate` listener and an initial `URLSearchParams` read restore state on back/forward and deep links. nginx `try_files ... /index.html` makes those deep links work in production.
- `pages/TypeSelection.jsx` renders the landing copy plus `components/common/QRCodeTypeSelector`, which defines the list of QR types (`url`, `vcard`, `wifi`, `email`, `sms`, `phone`, `text`).
- `pages/QRCodeForm.jsx` is the core. It owns a single antd `Form` whose values are the union of the type-specific fields and the shared customization fields, and it renders the preview.

Data flow inside `QRCodeForm`:
1. `renderForm()` switches on `qrType` to mount one of `components/forms/qr-types/*Form`. These components contain only `Form.Item`s; they render inside the parent `Form` and do not manage state. Field `name`s are the contract between a form component and the switch in `generateQRCodeFromValues`.
2. `components/forms/QRCodeCustomization` adds the shared `option*` fields (`optionImageType`, `optionMargin`, `optionQuality`, `optionDarkColor`, `optionLightColor`, `optionMaskPattern`, `optionWidth`, `errorCorrectionLevel`). Defaults come from `getDefaultQRCodeOptions()` in `utils/qrCodeGenerator.js` and are passed as `initialValues`.
3. `onValuesChange` regenerates on every keystroke once the type's minimum field is filled; the submit button runs the same path with validation.
4. `generateQRCodeFromValues` converts form values into the payload string via the `generate*String` helpers (`utils/qrCodeGenerator.js` for wifi/email/sms/phone/text, `types/vCard.js` for vCard), then calls `generateQRCode(qrData, values)`.
5. `generateQRCode` maps `option*` fields onto `qrcode` library options. SVG is special-cased through `QRCode.toString({type:"svg"})` and wrapped in a `data:image/svg+xml` URL; raster types go through `QRCode.toDataURL`. It returns `{url, mime}`, and the MIME drives the download file extension in `onDownloadImage`.
6. `components/common/QRCodePreview` is presentational: shows the image or spinner, the download button, and an optional dump of the raw payload string.

Adding a new QR type means touching four places: the type list in `QRCodeTypeSelector`, a new `qr-types/<Name>Form`, the `getTypeTitle` map plus both switches in `QRCodeForm`, and a `generate<Name>String` helper.

Other things worth knowing:
- Colour pickers: antd `ColorPicker` yields a colour object once touched but the default is a hex string, so `generateQRCode` handles both (`typeof === "string"` vs `.toHexString()`). Keep that when adding colour fields.
- `src/types/vCard.ts` and `src/types/vCard.js` are duplicates. There is no `tsconfig.json`, so CRA resolves the `.js` file; edit the `.js` one (and keep the `.ts` in sync or delete it).
- Theme tokens (primary `#392B58`, background `#ebe9ee`) are set once in the antd `ConfigProvider` in `App.js` and repeated as literals in a few components and in the default QR colours.
- Each component lives in its own folder with `index.jsx` and a `styles.css` imported by the component.
