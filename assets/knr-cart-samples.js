(() => {
  class KnrCartSamples extends HTMLElement {
    connectedCallback() {
      this.limit = Number(this.dataset.limit) || 0;
      this.pluralRules = new Intl.PluralRules(document.documentElement.lang || undefined);
      this.dialog = this.closest('dialog');
      this.content = this.parentElement;

      this.addEventListener('click', this.onClick);
      this.content?.addEventListener('click', this.onContentClick);
      this.dialog?.addEventListener('cancel', this.onCancel);
    }

    disconnectedCallback() {
      this.removeEventListener('click', this.onClick);
      this.content?.removeEventListener('click', this.onContentClick);
      this.dialog?.removeEventListener('cancel', this.onCancel);
    }

    get cards() {
      return [...this.querySelectorAll('[data-knr-sample]')];
    }

    get opener() {
      return this.content?.querySelector(`[aria-controls="${CSS.escape(this.id)}"]`);
    }

    open() {
      this.selection = new Set(this.cards.filter((card) => card.hasAttribute('data-key')).map((card) => card.dataset.knrSample));
      this.update();
      this.setInert(true);
      this.hidden = false;
      this.opener?.setAttribute('aria-expanded', 'true');
      this.querySelector('h3')?.focus({ preventScroll: true });
    }

    close() {
      this.hidden = true;
      this.setInert(false);
      this.opener?.setAttribute('aria-expanded', 'false');
      this.opener?.focus();
    }

    setInert(isInert) {
      [...(this.content?.children ?? [])].forEach((child) => {
        if (child !== this) child.inert = isInert;
      });
    }

    onContentClick = (event) => {
      if (event.target.closest('[data-knr-samples-open]')) this.open();
    };

    onCancel = (event) => {
      if (this.hidden) return;
      event.preventDefault();
      this.close();
    };

    onClick = (event) => {
      if (event.target.closest('[data-knr-samples-close]')) {
        this.close();
        return;
      }

      if (event.target.closest('[data-knr-samples-submit]')) {
        this.submit();
        return;
      }

      const card = event.target.closest('[data-knr-sample]');
      if (!card || card.disabled) return;

      const id = card.dataset.knrSample;
      if (this.selection.has(id)) {
        this.selection.delete(id);
      } else if (this.selection.size < this.limit) {
        this.selection.add(id);
      }
      this.update();
    };

    update() {
      const isFull = this.selection.size >= this.limit;

      this.cards.forEach((card) => {
        const isSelected = this.selection.has(card.dataset.knrSample);
        card.toggleAttribute('data-selected', isSelected);
        card.disabled = card.hasAttribute('data-unavailable') || (isFull && !isSelected);
      });

      const counter = `${this.selection.size}/${this.limit}`;
      this.querySelectorAll('[data-knr-samples-counter]').forEach((element) => {
        element.textContent = counter;
      });

      const status = this.querySelector('[data-knr-samples-status]');
      if (status && !this.hidden) {
        const size = this.selection.size;
        const template = this.pluralRules.select(size) === 'one' ? this.dataset.statusOne : this.dataset.statusOther;
        status.textContent = (template ?? '').replace('[selected]', size);
      }
    }

    async submit() {
      const removals = this.cards.filter((card) => card.dataset.key && !this.selection.has(card.dataset.knrSample));
      const additions = this.cards.filter((card) => !card.dataset.key && this.selection.has(card.dataset.knrSample));

      if (!removals.length && !additions.length) {
        this.close();
        return;
      }

      const drawer = this.closest('knr-cart-drawer');
      this.setAttribute('aria-busy', 'true');
      this.close();

      try {
        let data;
        if (removals.length) {
          data = await window.KnrCart.update({
            updates: Object.fromEntries(removals.map((card) => [card.dataset.key, 0])),
          });
        }
        if (additions.length) {
          data = await window.KnrCart.add(
            additions.map((card) => ({ id: Number(card.dataset.knrSample), quantity: 1, properties: { _knr_sample: '1' } })),
          );
        }
        window.KnrCart.notify(data);
      } catch (error) {
        const message = (error.status && error.message) || drawer?.dataset.errorMessage;
        try {
          window.KnrCart.notify(await window.KnrCart.refresh());
        } catch {}
        drawer?.showError(message);
      } finally {
        this.removeAttribute('aria-busy');
      }
    }
  }

  if (!customElements.get('knr-cart-samples')) {
    customElements.define('knr-cart-samples', KnrCartSamples);
  }
})();
