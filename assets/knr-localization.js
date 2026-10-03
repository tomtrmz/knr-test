(() => {
  class KnrLocalization extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      this.addEventListener('change', this.onChange);
    }

    disconnectedCallback() {
      this.removeEventListener('change', this.onChange);
    }

    onChange = (event) => {
      if (event.target.matches('select')) this.form?.requestSubmit();
    };
  }

  if (!customElements.get('knr-localization')) {
    customElements.define('knr-localization', KnrLocalization);
  }
})();
