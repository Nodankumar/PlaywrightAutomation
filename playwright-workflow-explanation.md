# Playwright GitHub Actions Workflow Explanation

This document explains the `.github/workflows/playwright.yml` workflow in detail for future reference.

## Workflow Overview

The workflow is defined at `.github/workflows/playwright.yml` and runs Playwright tests on GitHub Actions whenever code is pushed to or a pull request is created for the `main` or `master` branches.

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v5
    - uses: actions/setup-node@v5
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Azure Login
      uses: azure/login@v2
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    - name: Run Playwright tests
      env:
        PLAYWRIGHT_SERVICE_URL: ${{ vars.PLAYWRIGHT_SERVICE_URL }}
      run: npm run azure
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

---

## Top-level elements

- `name`
  - The display name of the workflow in GitHub Actions.
  - Here it is `Playwright Tests`.

- `on`
  - Defines the events that trigger the workflow.
  - `push` on `main` or `master` branches.
  - `pull_request` targeting `main` or `master` branches.

- `jobs`
  - Contains one or more jobs to execute.
  - This workflow has a single job named `test`.

---

## Job: `test`

```yaml
test:
  timeout-minutes: 60
  runs-on: ubuntu-latest
  steps:
```

- `timeout-minutes: 60`
  - Cancels the job if it runs longer than 60 minutes.

- `runs-on: ubuntu-latest`
  - Uses a GitHub-hosted Linux runner with the latest Ubuntu image.

---

## Workflow steps

### 1. Checkout repository

```yaml
- uses: actions/checkout@v5
```

- Retrieves the repository code into the runner workspace.
- Required to access source files, tests, and configuration.

### 2. Setup Node.js

```yaml
- uses: actions/setup-node@v5
  with:
    node-version: lts/*
```

- Installs Node.js on the runner.
- `node-version: lts/*` selects the latest long-term support (LTS) release.

### 3. Install dependencies

```yaml
- name: Install dependencies
  run: npm ci
```

- Runs `npm ci` to install package dependencies.
- `npm ci` installs exact versions from `package-lock.json` and is deterministic.

### 4. Azure Login

```yaml
- name: Azure Login
  uses: azure/login@v2
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}
```

- Authenticates the workflow with Azure.
- Uses the `AZURE_CREDENTIALS` secret stored in GitHub Secrets.
- Needed for Azure-related test execution or service access.

### 5. Run Playwright tests

```yaml
- name: Run Playwright tests
  env:
    PLAYWRIGHT_SERVICE_URL: ${{ vars.PLAYWRIGHT_SERVICE_URL }}
  run: npm run azure
```

- Executes the npm script `azure`.
- Sets the environment variable `PLAYWRIGHT_SERVICE_URL` from a GitHub variable.
- This step likely runs Playwright tests against an Azure-hosted service.

### 6. Upload test artifacts

```yaml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

- Uploads the `playwright-report/` directory as a workflow artifact.
- `if: ${{ !cancelled() }}` prevents upload when the workflow run was cancelled.
- `retention-days: 30` stores the artifact for 30 days.

---

## End-to-end behavior

1. Workflow triggers on push or pull request to `main`/`master`.
2. Code is checked out.
3. Node.js LTS is installed.
4. Dependencies are installed using `npm ci`.
5. Azure authentication is performed.
6. Playwright tests are executed through `npm run azure`.
7. `playwright-report/` is uploaded as an artifact if the run completes normally.

---

## Notes

- `actions/checkout@v5` and `actions/setup-node@v5` are standard GitHub Actions steps.
- `azure/login@v2` is used for Azure service authentication.
- `PLAYWRIGHT_SERVICE_URL` is a GitHub variable, not a secret.
- The `azure` npm script must exist in `package.json` and should run the test command.

If you want, this document can also be expanded with `package.json` script details or example Azure credentials setup.