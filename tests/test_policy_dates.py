"""Regression checks for content-based policy dates using real Git history."""
from pathlib import Path
from datetime import datetime, timedelta, timezone
import importlib.util
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
<p>First paragraph.</p><h3>Details</h3><p>Second paragraph.</p>
<ul><li>First list item.</li></ul></article></html>'''


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
        for slug in PAGES:
            page = self.page(slug)
            page.write_text(page.read_text(encoding='utf-8').replace(
                'Revised information</h2>', '<em>Revised information</em></h2>'),
                encoding='utf-8')
        self.commit('Restyle revised headings', '2026-11-06T12:00:00+00:00')
        self.assertEqual(self.stamp().returncode, 0)
        self.assertEqual(self.dates(), expected)

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

    def test_title_subheading_paragraph_and_list_revisions_update_date(self):
        page = self.page('privacy')
        edits = [('<h1>privacy</h1>', '<h1>Privacy policy</h1>'),
                 ('<h3>Details</h3>', '<h3>Updated details</h3>'),
                 ('First paragraph.', 'Revised paragraph.'),
                 ('First list item.', 'Revised list item.')]
        for day, (before, after) in enumerate(edits, start=7):
            with self.subTest(text=before):
                page.write_text(page.read_text(encoding='utf-8').replace(before, after),
                                encoding='utf-8')
                self.commit('Revise policy text', f'2026-11-{day:02}T18:00:00+00:00')
                result = self.stamp()
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(self.dates(), [f'2026-11-{day + 1:02}', '2026-11-02'])

    def test_uncommitted_text_uses_current_utc_plus_eight_date(self):
        page = self.page('privacy')
        page.write_text(page.read_text(encoding='utf-8').replace(
            'First paragraph.', 'Uncommitted revision.'), encoding='utf-8')
        before = page.read_bytes()
        result = self.stamp(check=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Refresh policy dates', result.stderr)
        self.assertEqual(before, page.read_bytes())
        today = datetime.now(timezone(timedelta(hours=8))).date().isoformat()
        self.assertEqual(self.stamp().returncode, 0)
        self.assertEqual(self.dates(), [today, '2026-11-02'])

    def test_date_check_is_read_only_and_repairs_stale_display(self):
        page = self.page('privacy')
        page.write_text(page.read_text(encoding='utf-8').replace(
            'datetime="2026-11-02">November 2, 2026',
            'datetime="1999-01-01">Wrong date'), encoding='utf-8')
        before = page.read_bytes()
        result = self.stamp(check=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Refresh policy dates', result.stderr)
        self.assertEqual(before, page.read_bytes())
        self.assertEqual(self.stamp().returncode, 0)
        self.assertEqual(self.dates(), ['2026-11-02', '2026-11-02'])
        self.assertEqual(self.stamp(check=True).returncode, 0)

    def test_multiline_date_markup_can_be_refreshed(self):
        page = self.page('privacy')
        page.write_text(page.read_text(encoding='utf-8').replace(
            '>November 2, 2026</time>', '>\n  November 2, 2026\n</time>'), encoding='utf-8')
        result = self.stamp()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.dates(), ['2026-11-02', '2026-11-02'])
        self.assertEqual(self.stamp(check=True).returncode, 0)

    def test_missing_or_duplicate_date_markers_are_rejected(self):
        page = self.page('privacy')
        original = page.read_text(encoding='utf-8')
        for html in [original.replace('data-policy-updated', 'data-other'),
                     original.replace('</header>',
                                      '<time data-policy-updated>Duplicate</time></header>')]:
            with self.subTest(html=html):
                page.write_text(html, encoding='utf-8')
                before = page.read_bytes()
                result = self.stamp(check=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('expected exactly one', result.stderr)
                self.assertEqual(before, page.read_bytes())

    def test_missing_policy_text_is_rejected(self):
        page = self.page('privacy')
        page.write_text(re.sub(r'<article>.*?</article>', '<article></article>',
                               page.read_text(encoding='utf-8'), flags=re.DOTALL),
                        encoding='utf-8')
        before = page.read_bytes()
        result = self.stamp(check=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Policy text is missing', result.stderr)
        self.assertEqual(before, page.read_bytes())

    def test_shallow_checkout_is_rejected(self):
        shallow = self.repo / 'shallow'
        self.git('clone', '--depth=1', self.repo.as_uri(), str(shallow))
        result = subprocess.run(
            [sys.executable, '-B', 'tools/update-policy-dates.py', '--check'],
            cwd=shallow, capture_output=True, text=True, encoding='utf-8')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('require full Git history', result.stderr)

    def test_merge_uses_content_revision_date_not_merge_date(self):
        self.commit('Stamp existing dates', '2026-11-03T12:00:00+00:00')
        original_branch = self.git('branch', '--show-current').strip()
        self.git('checkout', '-b', 'policy-heading')
        page = self.page('privacy')
        page.write_text(page.read_text(encoding='utf-8').replace(
            '</span> Information</h2>', '</span> Revised heading</h2>'), encoding='utf-8')
        self.commit('Revise section heading', '2026-11-08T18:00:00+00:00')
        self.git('checkout', original_branch)
        (self.repo / 'README.md').write_text('Unrelated change.', encoding='utf-8')
        self.commit('Unrelated main branch change', '2026-11-10T12:00:00+00:00')
        self.git('merge', '--no-ff', 'policy-heading', '-m', 'Merge policy update',
                 date='2026-11-12T12:00:00+00:00')
        result = self.stamp()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.dates(), ['2026-11-09', '2026-11-02'])


class PublishedPolicyHeadingTests(unittest.TestCase):
    def test_every_real_section_heading_is_included_in_fingerprint(self):
        spec = importlib.util.spec_from_file_location('policy_dates',
                                                     ROOT / 'tools/update-policy-dates.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        for slug, expected_count in [('privacy', 17), ('terms-and-conditions', 16)]:
            html = (ROOT / 'policies' / slug / 'index.html').read_text(encoding='utf-8')
            headings = list(re.finditer(r'<h2\b[^>]*>.*?</h2>', html, flags=re.DOTALL))
            self.assertEqual(len(headings), expected_count)
            original = module.fingerprint(html)
            for heading in headings:
                with self.subTest(policy=slug, heading=heading.group()):
                    changed = html[:heading.end() - 5] + ' revised' + html[heading.end() - 5:]
                    self.assertNotEqual(module.fingerprint(changed), original)


if __name__ == '__main__':
    unittest.main()
