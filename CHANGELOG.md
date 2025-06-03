# Changelog

All notable changes to this project will be documented in this file.

## [1.7.5] - 2025-05-30

### Added
- Implemented Elkjøp's budget year system (starts May 1st)
- Week numbers now align with Elkjøp's budget year
- Added support for proper week transitions across budget years

### Changed
- Modified week calculation to use budget year instead of calendar year
- Updated date utilities to handle budget year transitions
- Improved week navigation to work with budget year system

## [1.7.4] - 2025-05-30

### Fixed
- Fixed broken Elkjøp logo in PDF reports when running the packaged Windows version
- Changed logo handling to use base64 encoding instead of file paths for better compatibility

## [1.7.3] - 2025-05-30

### Added
- Animated progress bars in the navigation sidebar with smooth transitions
- Animated percentage numbers that count up/down when progress changes
- Progress bars now use gradient colors when goals are met

### Changed
- Improved progress bar animations to match the style of DaySummary component
- Enhanced visual feedback for goal completion in the navigation
- Fixed layout issues with content overlapping TitleBar
- Implemented proper 2x2 grid layout for sections below DaySummary
- Made progress bars reactive to store changes without requiring day button clicks

### Fixed
- Content no longer goes under the TitleBar due to proper z-index and padding
- Scrollbar now appears only in the main content area, not next to the TitleBar

## [1.7.2] - 2025-05-30

### Changed
- Temporarily disabled PDF export functionality while resolving issues with PDF generation and dependencies.

## [1.7.1] - 2025-05-29

### Fixed
- Sidebar progress bars now update live as you add or edit data, without needing to click a day button. Progress is now fully reactive to store changes.

## [1.7.0] - 2025-05-29

### Added
- Elkjøp logo is now displayed at the bottom right of generated PDF reports.
- Modularized Electron main process: split logic into `handlers`, `utils`, and `templates` directories for maintainability.
- PDF generation now uses Puppeteer and supports week-over-week comparison charts with dual Y-axes for AVS and count-based metrics.
- Chart.js is used for visualizing weekly performance in the PDF.
- Top performer calculations for AVS, Insurance, Precalibrated TVs, and Repair Tickets in the PDF report.
- Norwegian date formatting and week range in PDF reports.
- Option to generate PDF reports for a selected week, not just the current week.
- Build script (`build.sh`) now supports selective building for Linux, Windows, or both via command-line options.

### Changed
- All "Add ..." buttons in section components now display only a "+" symbol for a cleaner UI, with accessible `aria-label`s.
- PDF report title changed to "ASO Weekly Performance Report".
- Repair tickets in the PDF now reflect tickets created, not completed.
- Improved font rendering and consistency across Electron app and PDF output.
- Layout improvements: content now stretches full width regardless of sidebar state.
- PDF report template updated to use Elkjøp brand colors (green and blue).
- Refactored PDF generation logic to accept all data from the renderer process, removing direct DB access from the main process.

### Fixed
- Corrected date handling and week parsing for PDF reports (no more 'Invalid Date').
- Fixed calculation of totals and top performers for all metrics in the PDF.
- Fixed saving of PDF files to the user's Documents folder instead of a non-existent `reports` directory.
- Resolved issues with missing modules (`puppeteer`, `electron-pdf`) and dependency conflicts.
- Fixed chart rendering timing in PDF generation to ensure charts are fully rendered before PDF is created.
- Fixed linter/type errors in TypeScript components and Electron API typings.

### Removed
- Removed direct database imports from the Electron main process (now handled in renderer and passed as data).

---

## Previous versions

### [Earlier]
- Initial implementation of Electron app for Elkjøp report generation.
- Day and week report cards with dynamic titles from settings.
- Store and DB logic for saving and loading weekly data.
- Section components for AVS, Insurance Agreements, Precalibrated TVs, and Repair Tickets.
- UI built with React, Tailwind CSS, and custom components. 