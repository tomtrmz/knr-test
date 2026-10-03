(() => {
  const ADDED_LABEL_DURATION = 2000;

  class KnrCartForm extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      this.form?.addEventListener('submit', this.onSubmit);
    }

    disconnectedCallback() {
      this.form?.removeEventListener('submit', this.onSubmit);
    }

    onSubmit = async (event) => {
      event.preventDefault();

      const button = this.form.querySelector('[type="submit"]');
      if (button?.getAttribute('aria-disabled') === 'true') return;

      this.setLoading(button, true);
      this.showError('');

      const formData = new FormData(this.form);
      const sectionIds = [...document.querySelectorAll('[data-knr-cart-section]')].map(
        (element) => element.dataset.knrCartSection,
      );
      if (sectionIds.length) formData.append('sections', sectionIds.join(','));

      try {
        const response = await fetch(`${this.form.action}.js`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          const isCartRule = response.status === 422 && data.description;
          throw new Error(isCartRule ? data.description : this.dataset.errorMessage);
        }

        document.dispatchEvent(
          new CustomEvent('knr:cart:updated', { detail: { sections: data.sections ?? {} } }),
        );
        this.showAdded(button);
      } catch (error) {
        this.showError(error.message || this.dataset.errorMessage);
      } finally {
        this.setLoading(button, false);
      }
    };

    setLoading(button, isLoading) {
      if (!button) return;
      button.setAttribute('aria-disabled', String(isLoading));
      button.setAttribute('aria-busy', String(isLoading));
    }

    showAdded(button) {
      const label = button?.querySelector('[data-knr-add-label]');
      if (!label || !this.dataset.addedLabel) return;

      const initialLabel = label.textContent;
      label.textContent = this.dataset.addedLabel;

      window.setTimeout(() => {
        label.textContent = initialLabel;
      }, ADDED_LABEL_DURATION);
    }

    showError(message) {
      const error = this.querySelector('[data-knr-cart-error]');
      if (!error) return;

      error.textContent = message;
      error.hidden = !message;
    }
  }

  if (!customElements.get('knr-cart-form')) {
    customElements.define('knr-cart-form', KnrCartForm);
  }
})();
