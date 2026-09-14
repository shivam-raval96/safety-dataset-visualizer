#!/usr/bin/env python3
"""Dispatch Pages and verify the deployed revision contains the catalog commit."""
import json
import os
import subprocess
import time
from datetime import datetime, timezone


def gh(*args):
    return subprocess.check_output(['gh', *args], text=True).strip()


def main():
    sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
    since = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    gh('workflow', 'run', 'deploy-pages.yml', '--ref', 'main')
    deadline = time.monotonic() + 900
    run_id = None
    while time.monotonic() < deadline:
        if run_id is None:
            runs = json.loads(gh('run', 'list', '--workflow', 'deploy-pages.yml', '--event', 'workflow_dispatch',
                                 '--limit', '30', '--json', 'databaseId,headSha,createdAt'))
            for run in runs:
                if run['createdAt'] < since:
                    continue
                # Another request may advance main between our push and dispatch.
                includes_commit = run['headSha'] == sha
                if not includes_commit:
                    comparison = json.loads(gh('api', f"repos/{os.environ['GITHUB_REPOSITORY']}/compare/{sha}...{run['headSha']}"))
                    includes_commit = comparison['status'] in ('ahead', 'identical')
                if includes_commit:
                    run_id = run['databaseId']
                    break
        if run_id is not None:
            run = json.loads(gh('run', 'view', str(run_id), '--json', 'status,conclusion,url'))
            if run['status'] == 'completed':
                if run['conclusion'] != 'success':
                    raise RuntimeError('Pages deployment did not succeed: ' + run['url'])
                print('Pages deployment succeeded: ' + run['url'])
                return
        time.sleep(10)
    raise RuntimeError('Timed out waiting for Pages deployment of the requested catalog commit.')


if __name__ == '__main__':
    main()
