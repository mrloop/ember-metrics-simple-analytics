ember-metrics-simple-analytics
==============================================================================

[![CI](https://github.com/mrloop/ember-metrics-simple-analytics/actions/workflows/ci.yml/badge.svg)](https://github.com/mrloop/ember-metrics-simple-analytics/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/ember-metrics-simple-analytics.svg)](https://www.npmjs.com/package/ember-metrics-simple-analytics)



[ember-metrics](https://github.com/adopted-ember-addons/ember-metrics) adapter for [Simple Analytics](https://simpleanalytics.com/)


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.28 or above
* Embroider or ember-auto-import v2
* ember-metrics v2


Installation
------------------------------------------------------------------------------

```sh
ember install ember-metrics-simple-analytics
```


Configuration
------------------------------------------------------------------------------

To setup, you should first configure the service through `config/environemnt`:
```js
module.exports = function (environment) {
  var ENV = {
    metricsAdapters: [
      name: 'SimpleAnalytics',
      environments: ['production'],
    ]
  }
}
```

See the [Simple Analytics Docs](https://docs.simpleanalytics.com) for more details about the configuration options.

```js
module.exports = function (environment) {
  var ENV = {
    metricsAdapters: [
      name: 'SimpleAnalytics',
      environments: ['production'],
      config: {
        autoCollect: 'true',
        allowParams: 'product-id',
        collectDnt: false,
        hostname: 'picturewham.com',
        ignoreMetrices: ['scrolled', 'timeonpage'],
        ignorePages: ['/search/contact', '/vouchers/*'],
        mode: 'hash',
        nonUniqueHostnames: 'checkout.stripe.com',
        pathOverwriter: 'myPathOverwriter',
        src: 'my-custom-script.example.org/latest.js',
      }
    ]
  }
}
```


Usage
------------------------------------------------------------------------------

This adapter by default sets Simple Analytics auto collect to false. You must explicitly call `trackPage` when you transition into a route and you need to register `SimpleAnalytics` as a `metrics-adapter`, for example:

```js
// app/routes/application.js
import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { service } from '@ember/service';
import SimpleAnalytics from 'ember-metrics-simple-analytics';

export default class ApplicationRoute extends Route {
  @service metrics;
  @service router;

  constructor() {
    super(...arguments);

    getOwner(this).register(
      'metrics-adapter:simple-analytics',
      SimpleAnalytics
    );

    this.router.on('routeDidChange', () => {
      const page = this.router.currentURL;
      const title = this.router.currentRouteName || 'unknown';

      this.metrics.trackPage({ page, title });
    });
  }
}
```

To send custom events use:

```js
this.metrics.trackEvent({ name: 'myCustomeEvent', someotherkey: 'brilliant' });
```

### Deviations from plain Simple Analytics

#### Auto Collect

If you've used Simple Analytics before without `ember-metrics` then you'll notice that auto page view collection is usually enabled for Simple Analytics without this adapter.

Disabling Simple Analytics [auto collect page views](https://docs.simpleanalytics.com/trigger-custom-page-views) in this adapter allows for better integration with `ember-metrics`; it works well with multiple other adapters and is the expected behaviour of ember-metric adapters.

#### Metadata or Context

Simple Analytics provides numerous mechanisms to [collect additional data for events and page views](https://docs.simpleanalytics.com/metadata). The `ember-metrics` [`context`](https://github.com/adopted-ember-addons/ember-metrics#context) should be used instead of the Simple Analytics specific metadata mechanisms.

**Warning**
Do not include personal data in your metadata like email addresses, identifiers, or any other type of personal data. [Simple Analytics don’t allow it and your account might be suspended.](https://docs.simpleanalytics.com/metadata)

```js
this.metrics.context = {
  plan: 'starter'
};
```


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
