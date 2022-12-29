import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import SimpleAnalytics, { SRC_URL } from 'ember-metrics-simple-analytics';

module('Unit | Adapter | simple-analytics', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.adapter = new SimpleAnalytics();
  });

  hooks.afterEach(function () {
    if (scriptElement()) this.adapter.uninstall();
  });

  function scriptElement() {
    return document.querySelector('[src*="simpleanalytics"]');
  }

  module('install', function () {
    test('script data attributes can be configured', function (assert) {
      this.adapter.config = {
        collectDnt: false,
        hostname: 'picturewham.com',
        ignoreMetrics: ['timeonpage', 'scrolled'],
      };
      this.adapter.install();
      assert.strictEqual(scriptElement().dataset.collectDnt, 'false');
      assert.strictEqual(scriptElement().dataset.hostname, 'picturewham.com');
      assert.strictEqual(
        scriptElement().dataset.ignoreMetrics,
        'timeonpage,scrolled'
      );
    });

    test('it defaults auto collect to false', function (assert) {
      this.adapter.install();
      assert.strictEqual(scriptElement().dataset.autoCollect, 'false');
    });

    test('the default auto collect can be overridden', function (assert) {
      this.adapter.config = { autoCollect: true };
      this.adapter.install();
      assert.strictEqual(scriptElement().dataset.autoCollect, 'true');
    });

    test('script src can be configured', function (assert) {
      const src = `${SRC_URL}?potatoes`;
      this.adapter.config = { src };
      this.adapter.install();
      assert.strictEqual(scriptElement().src, src);
      assert.strictEqual(scriptElement().dataset.src, undefined);
    });
  });

  module('uninstall', function () {
    test('it removes the script element and global functions', async function (assert) {
      this.adapter.install();
      await waitUntil(() => typeof window.sa_event === 'function');
      assert.true(scriptElement() instanceof HTMLScriptElement);

      this.adapter.uninstall();
      assert.strictEqual(scriptElement(), null);
      assert.strictEqual(typeof window.sa_event, 'undefined');
      assert.strictEqual(typeof window.sa_pageview, 'undefined');
    });
  });

  module('function calls', function () {
    test('#trackEvent calls simpleanalytics with the correct arguments', async function (assert) {
      this.adapter.install();
      await waitUntil(() => this.adapter.loaded);
      assert.expect(1);
      window.sa_event = (...args) =>
        assert.deepEqual(args, ['test', { plan: 'starter' }]);
      this.adapter.trackEvent({ name: 'test', plan: 'starter' });
    });

    test('#trackPage calls simpleanalytics with the correct arguments', async function (assert) {
      this.adapter.install();
      await waitUntil(() => this.adapter.loaded);
      assert.expect(1);
      window.sa_pageview = (...args) =>
        assert.deepEqual(args, ['/test', { plan: 'starter' }]);
      this.adapter.trackPage({ path: '/test', plan: 'starter' });
    });

    module('configure namespace', function (hooks) {
      hooks.beforeEach(function () {
        this.adapter.config = { namespace: 'mrloop' };
      });

      test('#trackEvent calls simpleanalytics with the correct arguments', async function (assert) {
        this.adapter.install();
        await waitUntil(() => this.adapter.loaded);
        assert.expect(1);
        window.mrloop_event = (...args) =>
          assert.deepEqual(args, ['test', { plan: 'starter' }]);
        this.adapter.trackEvent({ name: 'test', plan: 'starter' });
      });

      test('#trackPage calls simpleanalytics with the correct arguments', async function (assert) {
        this.adapter.install();
        await waitUntil(() => this.adapter.loaded);
        assert.expect(1);
        window.mrloop_pageview = (...args) =>
          assert.deepEqual(args, ['/test', { plan: 'starter' }]);
        this.adapter.trackPage({ path: '/test', plan: 'starter' });
      });
    });
  });

  module('queue', function () {
    test('it queues events until the script is loaded', async function (assert) {
      this.adapter.install();
      assert.expect(3);
      window.sa_event = (...args) => assert.deepEqual(args, ['turnip', {}]);
      assert.false(this.adapter.loaded, 'adapter is not loaded');
      this.adapter.trackEvent({ name: 'turnip' });
      assert.deepEqual(
        this.adapter.queue,
        [{ fncName: 'trackEvent', options: { name: 'turnip' } }],
        'queue is populated'
      );
      await waitUntil(() => this.adapter.loaded);
      assert.deepEqual(this.adapter.queue, [], 'queue is emptied');
    });

    test('it queues page views until the script is loaded', async function (assert) {
      this.adapter.install();
      assert.expect(3);
      window.sa_event = (...args) => assert.deepEqual(args, ['/veg', {}]);
      assert.false(this.adapter.loaded, 'adapter is not loaded');
      this.adapter.trackPage({ path: '/veg' });
      assert.deepEqual(
        this.adapter.queue,
        [{ fncName: 'trackPage', options: { path: '/veg' } }],
        'queue is populated'
      );
      await waitUntil(() => this.adapter.loaded);

      assert.deepEqual(this.adapter.queue, [], 'queue is emptied');
    });
  });
});
