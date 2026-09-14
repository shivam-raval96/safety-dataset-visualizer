#!/usr/bin/env python3
"""Dispatch Pages and wait for a successful deployment of the current commit."""
import json
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
            matches = [run for run in runs if run['headSha'] == sha and run['createdAt'] >= since]
            if matches:
                run_id = matches[0]['databaseId']
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
