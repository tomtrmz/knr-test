(() => {
  class KnrReadMore extends HTMLElement {
    connectedCallback() {
      this.text = this.querySelector('[data-knr-read-more-text]');
      this.button = this.querySelector('[data-knr-read-more-button]');
      if (!this.text || !this.button) return;

      this.button.addEventListener('click', this.toggle);
      this.resizeObserver = new ResizeObserver(this.update);
      this.resizeObserver.observe(this.text);
      this.update();
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
      this.button?.removeEventListener('click', this.toggle);
    }

    toggle = () => {
      const isExpanded = this.button.getAttribute('aria-expanded') === 'true';
      this.setExpanded(!isExpanded);
    };

    setExpanded(isExpanded) {
      this.button.setAttribute('aria-expanded', String(isExpanded));
      this.button.textContent = isExpanded ? this.dataset.labelLess : this.dataset.labelMore;
      this.classList.toggle('is-expanded', isExpanded);
    }

    update = () => {
      const isExpanded = this.classList.contains('is-expanded');
      const isClamped = this.text.scrollHeight > this.text.clientHeight + 1;
      this.button.hidden = !isExpanded && !isClamped;
    };
  }

  if (!customElements.get('knr-read-more')) {
    customElements.define('knr-read-more', KnrReadMore);
  }
})();
