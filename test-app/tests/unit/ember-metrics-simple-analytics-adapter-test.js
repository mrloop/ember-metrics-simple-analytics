import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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
    test('it removes the script element', function (assert) {
      this.adapter.install();
      assert.true(scriptElement() instanceof HTMLScriptElement);

      this.adapter.uninstall();
      assert.strictEqual(scriptElement(), null);
    });
  });

  module('function calls', function () {
    test('#trackEvent calls simpleanalytics with the correct arguments', function (assert) {
      this.adapter.install();
      assert.expect(1);
      window.sa_event = (...args) =>
        assert.deepEqual(args, ['test', { plan: 'starter' }]);
      this.adapter.trackEvent({ name: 'test', plan: 'starter' });
    });

    test('#trackPage calls simpleanalytics with the correct arguments', function (assert) {
      this.adapter.install();
      assert.expect(1);
      window.sa_pageview = (...args) =>
        assert.deepEqual(args, ['/test', { plan: 'starter' }]);
      this.adapter.trackPage({ path: '/test', plan: 'starter' });
    });

    module('configure namespace', function (hooks) {
      hooks.beforeEach(function () {
        this.adapter.config = { namespace: 'mrloop' };
      });

      test('#trackEvent calls simpleanalytics with the correct arguments', function (assert) {
        this.adapter.install();
        assert.expect(1);
        window.mrloop_event = (...args) =>
          assert.deepEqual(args, ['test', { plan: 'starter' }]);
        this.adapter.trackEvent({ name: 'test', plan: 'starter' });
      });

      test('#trackPage calls simpleanalytics with the correct arguments', function (assert) {
        this.adapter.install();
        assert.expect(1);
        window.mrloop_pageview = (...args) =>
          assert.deepEqual(args, ['/test', { plan: 'starter' }]);
        this.adapter.trackPage({ path: '/test', plan: 'starter' });
      });
    });
  });
});
