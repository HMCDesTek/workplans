# Sigma Analytics and Databricks Roadmap

## Target product shape

The local workplan builder can become the front door for sustainability project planning and the record source for actuals tracking. The same payload emitted by the static app should become the contract between the UI, the Databricks access layer, and Sigma dashboards.

## Core data objects

- `workplan`: project metadata, size, selected services, billing assumptions, status, and timestamps.
- `workplan_line`: phase/task rows with planned hours, rate, fee, source template, notes, and active flag.
- `actual_line`: actual hours and costs from timekeeping, grouped to project, phase, task, person, week, and source system.
- `delta_snapshot`: planned versus actual rollups by project, phase, task, service, time period, and team member.

## API surface

- `POST /workplans`: create a workplan from the UI payload.
- `GET /workplans?query=&status=&lead=`: list saved workplans for revisit and editing.
- `GET /workplans/{id}`: load a full workplan with line items and version history.
- `PUT /workplans/{id}`: update metadata, services, and line items.
- `POST /workplans/{id}/exports`: generate CSV, XLSX, or email package.
- `GET /workplans/{id}/actuals`: return actual work mapped from timekeeping or project accounting.
- `GET /analytics/workplan-deltas`: return aggregate variance measures for Sigma.

## Databricks access layer

Use Databricks SQL Warehouse or Lakehouse APIs as the controlled access layer. The UI should call an internal API, and that API should handle authentication, authorization, and Databricks queries rather than placing Databricks tokens in the browser.

Recommended flow:

1. UI submits the workplan payload to an internal service.
2. Service validates the payload and writes bronze/silver tables in Delta.
3. Jobs reconcile actuals from the source systems into `actual_line`.
4. Gold views calculate planned hours, actual hours, fee variance, utilization, and schedule variance.
5. Sigma connects to the gold views for dashboards and controlled exploration.

## First dashboard set

- Portfolio overview: total planned hours, actual hours, delta, fee variance, projects at risk.
- Project detail: phase/task planned versus actual, certification/service scope, status notes.
- Team workload: planned hours by sustainability lead, week, phase, and service.
- Template calibration: average actual/planned ratio by size template and service option.
