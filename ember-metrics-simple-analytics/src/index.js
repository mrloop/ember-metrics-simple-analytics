import { isPresent } from '@ember/utils';
import { camelize } from '@ember/string';
import BaseAdapter from 'ember-metrics/metrics-adapters/base';
import { action } from '@ember/object';

export const SRC_URL = 'https://scripts.simpleanalyticscdn.com/latest.js';

export default class SimpleAnalytics extends BaseAdapter {
  loaded = false;
  queue = [];

  toStringExtension() {
    return 'SimpleAnalytics';
  }

  install() {
    const config = { autoCollect: false, ...this.config };
    this._injectScript(config);
  }

  _injectScript(config) {
    this._script = document.createElement('script');
    const { src, ...dataAttributes } = config;
    this._script.src = src || SRC_URL;
    Object.entries(dataAttributes).forEach(([key, value]) => {
      if (isPresent(value)) this._script.dataset[camelize(key)] = String(value);
    });
    document.body.appendChild(this._script);
    this._script.addEventListener('load', this.onScriptLoad);
  }

  identify() {
    // noop
  }

  trackEvent(options = {}) {
    if (this.loaded) {
      let { name, ...metadata } = options;
      window[this._namespaceEvent](name, metadata);
    } else {
      this.queue.push({ fncName: 'trackEvent', options });
    }
  }

  trackPage(options = {}) {
    if (this.loaded) {
      let { path, ...metadata } = options;
      window[this._namespacePageview](path, metadata);
    } else {
      this.queue.push({ fncName: 'trackPage', options });
    }
  }

  @action onScriptLoad() {
    this._script.removeEventListener('load', this.onScriptLoad);
    this.loaded = true;
    while (this.queue.length) {
      let { fncName, options } = this.queue.shift();
      this[fncName](options);
    }
  }

  uninstall() {
    document.body.removeChild(this._script);
    delete window[this._namespaceEvent];
    delete window[this._namespacePageview];
    delete window[this._namespaceLoaded];
    delete window[this._namespaceMetadata];
  }

  // https://docs.simpleanalytics.com/events#the-variable-sa_event-is-already-used
  get _namespace() {
    return this.config?.namespace || 'sa';
  }

  get _namespaceEvent() {
    return `${this._namespace}_event`;
  }

  get _namespacePageview() {
    return `${this._namespace}_pageview`;
  }

  get _namespaceLoaded() {
    return `${this._namespace}_loaded`;
  }

  get _namespaceMetadata() {
    return `${this._namespace}_metadata`;
  }
}
