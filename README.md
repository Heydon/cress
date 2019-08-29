# CRESS

**CRESS** stands for **Componentized Reactive ...Erm... Scoped Stylesheets**. Think of **CRESS** components as web components for styling, except without having to use the web components specs.

## Features

* Completely dependency free
* Completely framework independent
* <1KB minified ES module
* Automatic scoping
* SSR (Server-side Rendering) is easy
* Reactive to prop changes using `MutationObserver`
* `resize` method provided harnessing `ResizeObserver`

## The `this` keyword... in CSS??

Well, no, not really. The word 'this' in a string that looks like CSS is more like it. But it helps solve the scoping issue without having to worry about the CSS OM or having to use some sort of complex regular expression. Instead, you just write 'this' (or a different word you've chosen; it's configurable) wherever you need to represent the target/parent element in the selector.

```css
this button {
  color: red;
}
```

In the constructor 'this' is replaced globally by a special identifier, and that's how styles are scoped:

```css
[data-i="cress-wi5xdkbb9"] button {
  color: red;
}
```

## Props

When you create a new **CRESS** component, you can set some default props and interpolate these into the `css` method:

```js
new Cress('.test', {
  props: {
    color: 'red'
  },
  css(props) {
    return `
      this button {
        color: ${props.color};
      }
    `
  }
});
```

The neat thing is that every element matching `.test` will now share an embedded stylesheet identified by `cress-wi5xdkbb9-red`. The `wi5xdkbb9` part is shared by _all_ `.test` elements, and the `red` part is shared by all `.test` elements _where the `color` prop is `red`_. This saves on redundancy.

Now... if you apply the `data-color="blue"` attribution to one or more of your `.test` elements, their identifier will become `cress-wi5xdkbb9-blue` and a new stylesheet will be created to serve them differently. 

Every default prop can be overridden with an attribute of the pattern `data-[name of prop]`. You don't need to use props (you may just want the scoping feature) but they're v nice. 

## Reactivization

A `MutationObserver` is applied to each of the `.test` elements, so that when a prop-specific attribute is changed the new styles are applied. That's the reactive part, and makes **CRESS** components a bit like custom elements. However, they are much easier to SSR: custom elements are [not currently supported by JSDOM, for instance](https://github.com/jsdom/jsdom/issues/1030).

`MutationObserver` is [nearly universally supported](https://caniuse.com/#feat=mutationobserver); [Custom Elements are not nearly universally supported](https://caniuse.com/#feat=mutationobserver&search=custom%20elements).

## Container queries too??

**CRESS** components are initialized with two arguments: a CSS selector, and a config object. As well as the default `props` object and the `css()` method, you can add and adjust some other things too. The `resize()` method lets you do stuff when the (parent) element (the element that matches the selector) is resized. This allows you to create container queries!

Consider the following example:

```js
new Cress('.test', {
  props: {
    fontBig: '1.5rem',
    fontSmall: '0.85rem'
  },
  css(props) {
    return `
      this button {
        font-size: ${props.fontBig};
      }

      this.small button {
        font-size: ${props.fontSmall};
      }
    `
  },
  resize(elem) {
    elem.classList.toggle(
      'small',
      elem.contentRect.width < 400
    );
  }
});
```

Now, wherever the `.test` element is narrower than `400px`, it will adopt the `.small` class and the `props.fontSmall` text size. Goodness!

`ResizeObserver` is [not the most well supported observer](https://caniuse.com/#search=resizeObserver) (although it has recently come to Firefox), so it's recommended `resize()` stuff is limited to progressive enhancements only, for production sites, for now.

## What about Shadow DOM? Isn't that what everyone wants?

No! Everyone thinks Shadow DOM will mean styles are completely sandboxed, like you're using an `<iframe>`. But they're not, which is shit.

The identifiers used in **CRESS** components handle styles not leaking _out_ to other elements (think [Vue's implementation](https://vue-loader.vuejs.org/guide/scoped-css.html)). To stop styles leaking _in_, you have the option of _reseting_ them with the `reset` config option:

```js
new Cress('.test', {
  reset: true, // ← added line
  props: {
    color: 'red'
  },
  css(props) {
    return `
      this button {
        color: ${props.color};
      }
    `
  }
});
```

All this does is prepend the css with the following:

```css
[data-i="cress-wi5xdkbb9"] { 
  all: initial 
} 

[data-i="cress-wi5xdkbb9"] * { 
  all: initial 
}
```

And that's all you need, probably.




