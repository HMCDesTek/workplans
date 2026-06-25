# Sustainability Workplan Builder

Open `index.html` in a browser to use the local workplan tool. It is a standalone static app, so it does not need a server or package install.

The app uses the 2025 sustainability support rubric from `Sustainabilty Support Rubric_250620(1).xlsx` as the base S/M/L template. Saved workplans are stored in browser local storage and can be revisited, edited, re-saved, exported to CSV or Excel-compatible `.xls`, and packaged for email.

Email behavior is browser-safe: the app can open a prefilled mail draft and can download a `.eml` package with the CSV attached. A real one-click send flow will need an email service or internal API behind authentication.

## Current scope

- Project setup fields for project details, email recipient, project size, building count, square feet, and billing rate.
- Green Building certification toggle with LEED, CHPS, LCA, CALGreen CxA (External), and Specialty Services options.
- Generated workplan rows by phase with editable hours, rates, active status, notes, totals, and phase mix.
- Saved workplan library for loading previous records, editing, duplicating, and re-saving.
- API-ready JSON payload preview for the future Sigma Analytics and Databricks-backed version.

## Source template notes

The base rubric rows are taken from the workbook's `2025 Fee Planning` sheet. The workbook lists LEED, CHPS, LCA, CALGreen CxA, and Specialty Services as project-specific services to consider, but it does not provide full fee rows for them. The app adds editable planning allowances for those rows and labels them as allowances so the team can adjust before saving or sending.

The source workbook uses the $240 average billing rate for most rows, with two large-project rows calculated at $215/hr. Those row-level rates are preserved in the app and remain editable in the generated workplan table.
