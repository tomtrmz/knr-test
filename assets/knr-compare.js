(() => {
  class KnrCompare extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('[data-knr-compare-input]');
      if (!this.input) return;

      this.input.addEventListener('input', this.update);
      this.update();
    }

    disconnectedCallback() {
      this.input?.removeEventListener('input', this.update);
    }

    update = () => {
      this.style.setProperty('--knr-compare-position', `${this.input.value}%`);
    };
  }

  if (!customElements.get('knr-compare')) {
    customElements.define('knr-compare', KnrCompare);
  }
})();
