import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { readinessMessage } from './backend-status';
import HomePage from './HomePage';

test('healthy readiness hides the API release/snapshot presentation', () => {
  assert.equal(readinessMessage(true, { ok: true, release: '1.1.1', snapshotId: '7ef6b2c05ce8' }), null);
});
test('failed or malformed readiness keeps a useful error message', () => {
  for (const [httpOk, payload] of [[false, { ok: true }], [true, { ok: false }], [true, null], [true, {}], [true, { ok: 'true' }]] as const)
    assert.equal(readinessMessage(httpOk, payload), 'API chưa sẵn sàng');
});
test('shell removes TEST/DEMO banners while retaining the demo-only footer role control', () => {
  const source = fs.readFileSync('src/App.tsx', 'utf8');
  assert.ok(!source.includes('className="demo-banner"'));
  assert.ok(!source.includes('TEST — KHÔNG NHẬP DỮ LIỆU THẬT'));
  assert.ok(!source.includes('DEMO · KHÔNG NHẬP DỮ LIỆU THẬT'));
  assert.ok(source.indexOf('className="demo-role-control"') > source.indexOf('<footer'));
  assert.ok(source.includes('DEMO_MODE && <label className="demo-role-control"'));
});
test('welcome brand has scoped larger typography without changing other brand uses', () => {
  const html = renderToStaticMarkup(<MemoryRouter><HomePage /></MemoryRouter>);
  assert.ok(html.includes('class="font-brand welcome-brand"'));
  const css = fs.readFileSync('src/index.css', 'utf8');
  assert.match(css, /\.hero-copy \.welcome-brand\{[^}]*font-size:1\.3em/);
  assert.match(css, /\.hero-copy \.welcome-brand\{[^}]*white-space:nowrap/);
});
