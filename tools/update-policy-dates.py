"""Stamp static policy dates from the last Git revision of their policy text.

Run before local preview or publishing. Markup, CSS, navigation and date-only
changes do not change a policy's date. Each policy is dated independently.
"""
import argparse
from datetime import datetime, timedelta, timezone
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
DISPLAY_TIMEZONE = timezone(timedelta(hours=8))
PAGES = ('privacy', 'terms-and-conditions')


class PolicyText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.article = False
        self.tag = None
        self.buffer = []
        self.blocks = []

    def handle_starttag(self, tag, attrs):
        if tag == 'article':
            self.article = True
        if tag == 'h1' or (self.article and tag in ('p', 'li', 'h2', 'h3')):
            self.tag, self.buffer = tag, []
        if tag == 'br' and self.tag:
            self.buffer.append(' ')

    def handle_data(self, value):
        if self.tag:
            self.buffer.append(value)

    def handle_endtag(self, tag):
        if tag == self.tag:
            self.blocks.append(' '.join(''.join(self.buffer).split()))
            self.tag = None
        if tag == 'article':
            self.article = False


def fingerprint(html):
    parser = PolicyText()
    parser.feed(html)
    if len(parser.blocks) < 3:
        raise ValueError('Policy text is missing; refusing to generate a date.')
    return hashlib.sha256('\n'.join(parser.blocks).encode()).hexdigest()


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True, encoding='utf-8').strip()


def content_date(path, html):
    """Walk through matching text revisions, ignoring cosmetic commits."""
    digest = fingerprint(html)
    candidate = None
    for entry in git('log', '--format=%H%x09%cI', '--', path).splitlines():
        revision, committed = entry.split('\t', 1)
        snapshot = git('show', f'{revision}:{path}')
        if fingerprint(snapshot) != digest:
            break
        candidate = datetime.fromisoformat(committed).astimezone(DISPLAY_TIMEZONE).date()
    # An uncommitted/new text revision gets today's date until its commit exists.
    return candidate or datetime.now(DISPLAY_TIMEZONE).date()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check dates without modifying files.')
    args = parser.parse_args()
    if git('rev-parse', '--is-shallow-repository') == 'true':
        raise SystemExit('Policy dates require full Git history (actions/checkout fetch-depth: 0).')
    stale = []
    for slug in PAGES:
        relative = f'policies/{slug}/index.html'
        path = ROOT / relative
        original = path.read_text(encoding='utf-8')
        updated = content_date(relative, original)
        display = f'{updated:%B} {updated.day}, {updated.year}'
        replacement = f'<time data-policy-updated datetime="{updated.isoformat()}">{display}</time>'
        html, matches = re.subn(r'<time\b(?=[^>]*\bdata-policy-updated)[^>]*>.*?</time>', replacement, original)
        if matches != 1:
            raise SystemExit(f'{relative}: expected exactly one data-policy-updated time element.')
        if html != original:
            stale.append(relative)
            if not args.check:
                path.write_text(html, encoding='utf-8', newline='\n')
        print(f'{relative}: Last updated {display}')
    if stale and args.check:
        raise SystemExit('Refresh policy dates with: python tools/update-policy-dates.py')


if __name__ == '__main__':
    main()
