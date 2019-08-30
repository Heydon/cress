/**
 * Constructor for creating CRESS stylesheet components
 * @param {String} selector The selector to match nodes that will become instances of the CRESS component
 * @param {Object} config The configuration object. See [the README on Github]{@link https://github.com/Heydon/cress/blob/master/README.md}
 * @class
 */
function Cress(selector, config) {
  this.elems = Array.from(document.querySelectorAll(selector));
  this.this = config.this || 'this';
  this.pattern = new RegExp(this.this, 'g');
  this.sharedId = Math.random().toString(36).substr(2, 9);
  this.reset = `${this.this}, ${this.this} * { all: initial }`;

  this.getProps = elem => {
    if (!config.props) {
      return null;
    }
    let props = {};
    for (let prop in config.props) {
      let attr = elem.getAttribute(`data-cress-${prop}`);
      props[prop] = attr ? attr : config.props[prop];
    }
    return props;
  }

  this.styleUp = elem => {
    let props = this.getProps(elem);
    let i = !props ? this.sharedId : this.sharedId + '-' + Object.values(props).join('');
    elem.dataset.cress = i;

    let styles = config.reset ? this.reset + config.css(props) : config.css(props);
    let css = styles.replace(this.pattern, `[data-cress="${i}"]`);

    if (!document.getElementById(i)) {
      document.head.innerHTML += `
        <style id="${i}">${css.replace(/\s\s+/g, ' ').trim()}</style>
      `;
    }
  }

  this.elems.forEach(elem => {
    config.props && new MutationObserver(() => {
      this.styleUp(elem);
    }).observe(elem, {
      attributes: true,
      attributeFilter: Object.keys(config.props).map(k => `data-${k}`)
    });

    if ('ResizeObserver' in window && config.resize) {
      new ResizeObserver(entries => {
        config.resize(entries[0]);
      }).observe(elem);
    }

    this.styleUp(elem);
  });
}

export { Cress };