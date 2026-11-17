"""Regression checks for content-based policy dates using real Git history."""
from pathlib import Path
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
PAGES = ('privacy', 'terms-and-conditions')
TEMPLATE = '''<html><header><h1>{title}</h1>
<time data-policy-updated datetime="2000-01-01">Old date</time></header>
<nav><h2>Policy navigation</h2><a href="#heading-1">Information</a></nav>
<article><h2 id="heading-1"><span class="section-number">01</span> Information</h2>
<p>First paragraph.</p><h3>Details</h3><p>Second paragraph.</p></article></html>'''


class PolicyDateTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix='policy-date-tests-')
        self.addCleanup(temporary.cleanup)
        self.repo = Path(temporary.name)
        (self.repo / 'tools').mkdir()
        shutil.copyfile(ROOT / 'tools/update-policy-dates.py',
                        self.repo / 'tools/update-policy-dates.py')
        for slug in PAGES:
            page = self.page(slug)
            page.parent.mkdir(parents=True)
            page.write_text(TEMPLATE.format(title=slug), encoding='utf-8')
        self.git('init')
        self.commit('Initial policies', '2026-11-01T16:30:00+00:00')
        result = self.stamp()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.dates(), ['2026-11-02', '2026-11-02'])

    def page(self, slug):
        return self.repo / 'policies' / slug / 'index.html'

    def git(self, *args, date=None):
        env = dict(os.environ)
        if date:
            env.update(GIT_AUTHOR_DATE=date, GIT_COMMITTER_DATE=date)
        return subprocess.check_output(
            ['git', '-c', 'user.name=Policy Date Tests',
             '-c', 'user.email=policy-tests@example.invalid', *args],
            cwd=self.repo, env=env, text=True, encoding='utf-8',
            stderr=subprocess.STDOUT)

    def commit(self, message, date):
        self.git('add', '.')
        self.git('commit', '-m', message, date=date)

    def stamp(self, check=False):
        return subprocess.run(
            [sys.executable, '-B', 'tools/update-policy-dates.py']
            + (['--check'] if check else []), cwd=self.repo,
            text=True, encoding='utf-8', capture_output=True)

    def dates(self):
        return [re.search(r'datetime="([^"]+)"',
                          self.page(slug).read_text(encoding='utf-8')).group(1)
                for slug in PAGES]

    def test_h2_only_edits_update_each_policy_independently(self):
        expected = ['2026-11-02', '2026-11-02']
        for index, slug in enumerate(PAGES):
            with self.subTest(policy=slug):
                page = self.page(slug)
                page.write_text(page.read_text(encoding='utf-8').replace(
                    '</span> Information</h2>', '</span> Revised information</h2>'),
                    encoding='utf-8')
                self.commit(f'Revise {slug} section heading',
                            f'2026-11-0{3 + index}T18:00:00+00:00')
                self.assertNotEqual(self.stamp(check=True).returncode, 0)
                result = self.stamp()
                self.assertEqual(result.returncode, 0, result.stderr)
                expected[index] = f'2026-11-0{4 + index}'
                self.assertEqual(self.dates(), expected)
                before = [self.page(item).read_bytes() for item in PAGES]
                self.assertEqual(self.stamp().returncode, 0)
                self.assertEqual(self.stamp(check=True).returncode, 0)
                self.assertEqual(before, [self.page(item).read_bytes() for item in PAGES])

    def test_heading_markup_navigation_and_date_edits_preserve_dates(self):
        for slug in PAGES:
            page = self.page(slug)
            html = page.read_text(encoding='utf-8').replace(
                '</span> Information</h2>', '</span> <em>Information</em></h2>')
            html = html.replace('Policy navigation</h2>', 'Updated navigation</h2>')
            html = html.replace('November 2, 2026', 'Stale date')
            page.write_text(html, encoding='utf-8')
        self.commit('Restyle headings and update navigation', '2026-11-06T12:00:00+00:00')
        self.assertNotEqual(self.stamp(check=True).returncode, 0)
        result = self.stamp()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.dates(), ['2026-11-02', '2026-11-02'])
        self.assertEqual(self.stamp(check=True).returncode, 0)


if __name__ == '__main__':
    unittest.main()
