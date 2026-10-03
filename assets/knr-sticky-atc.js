(() => {
  class KnrStickyAtc extends HTMLElement {
    connectedCallback() {
      this.main = document.querySelector('knr-product-main');
      const mainButton = this.main?.querySelector('[data-knr-add-button]');
      if (!mainButton) return;

      this.isPastMainButton = false;
      this.isFooterVisible = false;

      this.observer = new IntersectionObserver(this.onIntersect);
      this.observer.observe(mainButton);

      this.footer = document.querySelector('footer');
      if (this.footer) {
        this.footerObserver = new IntersectionObserver(this.onFooterIntersect);
        this.footerObserver.observe(this.footer);
      }

      document.addEventListener('knr:variant:change', this.onVariantChange);
      this.addEventListener('change', this.onOptionChange);
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      this.footerObserver?.disconnect();
      document.removeEventListener('knr:variant:change', this.onVariantChange);
      this.removeEventListener('change', this.onOptionChange);
    }

    onIntersect = ([entry]) => {
      this.isPastMainButton = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      this.updateVisibility();
    };

    onFooterIntersect = ([entry]) => {
      this.isFooterVisible = entry.isIntersecting;
      this.updateVisibility();
    };

    updateVisibility() {
      const isVisible = this.isPastMainButton && !this.isFooterVisible;
      this.classList.toggle('is-visible', isVisible);
      this.inert = !isVisible;
    }

    onOptionChange = (event) => {
      const input = event.target;
      if (!input.matches('[data-knr-option]')) return;

      const position = input.dataset.optionPosition;
      const mainInput = [
        ...this.main.querySelectorAll(`[data-knr-option][data-option-position="${position}"]`),
      ].find((candidate) => candidate.value === input.value);

      mainInput?.click();
    };

    onVariantChange = (event) => {
      const { variant } = event.detail;

      this.querySelectorAll('[data-knr-option]').forEach((input) => {
        const optionIndex = Number(input.dataset.optionPosition) - 1;
        input.checked = variant.options[optionIndex] === input.value;
      });

      const price = this.querySelector('[data-knr-price]');
      const comparePrice = this.querySelector('[data-knr-compare-price]');
      if (price) price.textContent = variant.price;
      if (comparePrice) {
        comparePrice.textContent = variant.compareAtPrice ?? '';
        comparePrice.hidden = !variant.compareAtPrice;
      }

      const idInput = this.querySelector('[data-knr-variant-id]');
      if (idInput) idInput.value = variant.id;

      const button = this.querySelector('[data-knr-add-button]');
      const label = button?.querySelector('[data-knr-add-label]');
      if (button && label) {
        button.disabled = !variant.available;
        label.textContent = variant.available ? button.dataset.labelAdd : button.dataset.labelSoldOut;
      }
    };
  }

  if (!customElements.get('knr-sticky-atc')) {
    customElements.define('knr-sticky-atc', KnrStickyAtc);
  }
})();
