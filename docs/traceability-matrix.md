# Test Case Traceability Matrix

One identifier per spec file (not per individual assertion), since a
finer grain would add identifiers without adding useful traceability.

| ID           | Spec file                                                       | Feature                | Risk | Suite(s)                       | Priority |
| ------------ | --------------------------------------------------------------- | ---------------------- | ---- | ------------------------------ | -------- |
| MOB-SMK-001  | tests/smoke/applicationLaunch.spec.ts                           | Application launch     | P0   | smoke, critical                | P0       |
| MOB-SMK-002  | tests/smoke/catalogAndProduct.spec.ts                           | Catalog, product, cart | P0   | smoke, critical                | P0       |
| MOB-SMK-003  | tests/smoke/authentication.spec.ts                              | Authentication         | P1   | smoke, critical                | P1       |
| MOB-SMK-004  | tests/smoke/checkout.spec.ts                                    | Checkout               | P0   | smoke, critical                | P0       |
| MOB-SMK-005  | tests/smoke/menu.spec.ts                                        | Navigation             | P2   | smoke                          | P2       |
| MOB-CAT-001  | tests/functional/catalog/catalogDisplay.spec.ts                 | Catalog                | P1   | functional, regression         | P1       |
| MOB-CAT-002  | tests/functional/catalog/catalogSorting.spec.ts                 | Catalog                | P2   | functional, regression         | P2       |
| MOB-PROD-001 | tests/functional/product/productDetails.spec.ts                 | Product details        | P1   | functional, regression         | P1       |
| MOB-CART-001 | tests/functional/cart/cartBasics.spec.ts                        | Cart                   | P1   | functional, critical           | P1       |
| MOB-CART-002 | tests/functional/cart/cartAdvanced.spec.ts                      | Cart                   | P1   | functional, regression         | P1       |
| MOB-AUTH-001 | tests/functional/authentication/login.spec.ts                   | Authentication         | P1   | functional, critical           | P1       |
| MOB-CHK-001  | tests/functional/checkout/checkoutShipping.spec.ts              | Checkout               | P2   | functional, checkout           | P2       |
| MOB-CHK-002  | tests/functional/checkout/checkoutPayment.spec.ts               | Checkout               | P2   | functional, checkout           | P2       |
| MOB-CHK-003  | tests/functional/checkout/checkoutOverviewAndCompletion.spec.ts | Checkout               | P0   | functional, critical, checkout | P0       |
| MOB-NAV-001  | tests/functional/navigation/menuNavigation.spec.ts              | Navigation             | P2   | functional, regression         | P2       |
| MOB-DEV-001  | tests/device/lifecycle.spec.ts                                  | Device lifecycle       | P1   | device, regression             | P1       |
| MOB-DEV-002  | tests/device/appState.spec.ts                                   | Device lifecycle       | P2   | device, regression             | P2       |
| MOB-DEV-003  | tests/device/orientation.spec.ts                                | Device orientation     | P2   | device, regression             | P2       |
| MOB-DEV-004  | tests/device/keyboard.spec.ts                                   | Device keyboard        | P2   | device, regression             | P2       |
| MOB-DEV-005  | tests/device/androidBack.spec.ts                                | Device navigation      | P2   | device, regression             | P2       |
| MOB-PERM-001 | tests/device/permissions.spec.ts                                | Runtime permissions    | P1   | device, permissions            | P1       |
| MOB-PERM-002 | tests/device/scanner.spec.ts                                    | QR code scanner        | P2   | device, permissions            | P2       |
| MOB-ACC-001  | tests/accessibility/catalogAccessibility.spec.ts                | Accessibility          | P2   | accessibility, advanced        | P2       |
| MOB-ACC-002  | tests/accessibility/productDetailsAccessibility.spec.ts         | Accessibility          | P2   | accessibility, advanced        | P2       |
| MOB-ACC-003  | tests/accessibility/cartAccessibility.spec.ts                   | Accessibility          | P2   | accessibility, advanced        | P2       |
| MOB-ACC-004  | tests/accessibility/loginAccessibility.spec.ts                  | Accessibility          | P2   | accessibility, advanced        | P2       |
| MOB-ACC-005  | tests/accessibility/checkoutAccessibility.spec.ts               | Accessibility          | P2   | accessibility, advanced        | P2       |
| MOB-ACC-006  | tests/accessibility/fontScale.spec.ts                           | Accessibility          | P2   | accessibility, advanced        | P2       |
| MOB-VIS-001  | tests/visual/catalogVisual.spec.ts                              | Visual regression      | P2   | visual, advanced               | P2       |
| MOB-VIS-002  | tests/visual/productDetailsVisual.spec.ts                       | Visual regression      | P2   | visual, advanced               | P2       |
| MOB-VIS-003  | tests/visual/cartVisual.spec.ts                                 | Visual regression      | P2   | visual, advanced               | P2       |
| MOB-VIS-004  | tests/visual/loginVisual.spec.ts                                | Visual regression      | P2   | visual, advanced               | P2       |
| MOB-VIS-005  | tests/visual/checkoutOverviewVisual.spec.ts                     | Visual regression      | P2   | visual, advanced               | P2       |
| MOB-VIS-006  | tests/visual/purchaseConfirmationVisual.spec.ts                 | Visual regression      | P2   | visual, advanced               | P2       |
| MOB-INS-001  | tests/installation/cleanInstall.spec.ts                         | Installation           | P0   | installation, advanced         | P0       |
| MOB-INS-002  | tests/installation/reinstallation.spec.ts                       | Installation           | P2   | installation, advanced         | P2       |
| MOB-UPG-001  | tests/upgrade/applicationUpgrade.spec.ts                        | Upgrade                | P2   | upgrade, advanced              | P2       |
| MOB-COMP-001 | tests/compatibility/criticalPathAcrossProfiles.spec.ts          | Compatibility          | P1   | compatibility                  | P1       |
| MOB-COMP-002 | tests/compatibility/localeAndDisplay.spec.ts                    | Compatibility          | P2   | compatibility                  | P2       |
| MOB-STAB-001 | tests/stability/soak.spec.ts                                    | Stability              | P2   | stability, advanced            | P2       |
| MOB-PERF-001 | tests/performance/functionalTiming.spec.ts                      | Performance            | P2   | performance, advanced          | P2       |
| MOB-WEB-001  | tests/mobile-web/sauceDemoBrowsing.spec.ts                      | Mobile web             | P3   | mobile-web                     | P3       |
| MOB-SEC-001  | tests/security/logcatSecretScan.spec.ts                         | Security               | P2   | security, advanced             | P2       |
| MOB-SEC-002  | tests/security/screenshotProtection.spec.ts                     | Security               | P3   | security, advanced             | P3       |

Static, no-device disciplines are traced separately since they are not
WebdriverIO specs: `security-scan.ts` (APK/manifest/secret/dependency
analysis) is exercised by
`src/services/apkPackageService.test.ts`,
`src/services/manifestAnalysisService.test.ts` and
`src/services/secretScanService.test.ts`, and
`stability-summarize.ts` by `src/services/stabilityMetricsService.test.ts`
— all genuinely executed unit tests, not spec files, so they are recorded
here by name rather than assigned a `MOB-*` spec identifier.
