# dev-tools

Developer-only helpers. None of these files are part of the app or the Android bundle.

| File | Purpose |
| --- | --- |
| `test.html` | In-browser smoke tests that load `../index.html` in an iframe. Serve the repo root (`python3 -m http.server 8765`) and open `http://localhost:8765/dev-tools/test.html`. |
| `generate_fitdash_mock_data.py` | Writes `fitdash_backup_mock_30days.json` (30 days of fake data) in the current folder. Import it via Settings → Data Management → Import. |
| `fitdash_mock_data.json`, `fitdash_backup_mock_30days.json` | Ready-made mock backups for manual testing. |
| `extract_css.ps1` | One-off script that split inline CSS into `css/style.css`. Run from the repo root if ever needed again. |
| `walkthrough.md`, `task.md` | Historical working notes. |
