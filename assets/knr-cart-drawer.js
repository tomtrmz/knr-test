(() => {
  const MAX_SYNC_ATTEMPTS = 3;

  class KnrCartDrawer extends HTMLElement {
    connectedCallback() {
      this.sectionId = this.dataset.knrCartSection;
      this.dialog = this.querySelector('[data-knr-cart-drawer-dialog]');
      if (!this.dialog) return;

      this.dialog.addEventListener('click', this.onDialogClick);
      this.dialog.addEventListener('close', this.onClose);
      document.addEventListener('click', this.onDocumentClick);
      document.addEventListener('knr:cart:updated', this.onCartUpdated);
      document.addEventListener('shopify:section:select', this.onSectionSelect);
      document.addEventListener('shopify:section:deselect', this.onSectionDeselect);
      this.sync();
    }

    disconnectedCallback() {
      this.dialog?.removeEventListener('click', this.onDialogClick);
      this.dialog?.removeEventListener('close', this.onClose);
      document.removeEventListener('click', this.onDocumentClick);
      document.removeEventListener('knr:cart:updated', this.onCartUpdated);
      document.removeEventListener('shopify:section:select', this.onSectionSelect);
      document.removeEventListener('shopify:section:deselect', this.onSectionDeselect);
      this.onClose();
    }

    get content() {
      return this.querySelector('[data-knr-cart-drawer-content]');
    }

    open() {
      if (this.dialog.open) return;
      document.documentElement.style.overflow = 'hidden';
      this.dialog.showModal();
    }

    close() {
      if (this.dialog.open) this.dialog.close();
    }

    onClose = () => {
      document.documentElement.style.overflow = '';
    };

    onDocumentClick = (event) => {
      const trigger = event.target.closest('[data-knr-cart-drawer-open]');
      if (!trigger) return;

      event.preventDefault();
      this.open();
    };

    onDialogClick = (event) => {
      if (event.target === this.dialog) {
        this.close();
        return;
      }

      const button = event.target.closest('[data-knr-cart-quantity]');
      if (!button) return;

      if (button.hasAttribute('data-knr-cart-gift')) {
        this.declineGift(button.dataset.key);
      } else {
        this.changeQuantity(button.dataset.key, Number(button.dataset.knrCartQuantity));
      }
    };

    onSectionSelect = (event) => {
      if (event.detail?.sectionId === this.sectionId) this.open();
    };

    onSectionDeselect = (event) => {
      if (event.detail?.sectionId === this.sectionId) this.close();
    };

    onCartUpdated = (event) => {
      this.render(event.detail?.sections?.[this.sectionId]);
      if (event.detail?.open) this.open();
      this.sync();
    };

    changeQuantity(key, quantity) {
      if (!key) return;
      this.request(() => window.KnrCart.change(key, Math.max(quantity, 0)));
    }

    declineGift(key) {
      if (!key) return;
      this.request(() =>
        window.KnrCart.update({ updates: { [key]: 0 }, attributes: { _knr_gift_declined: 'true' } }),
      );
    }

    async request(action) {
      if (this.isBusy) return;

      this.setBusy(true);
      this.showError('');

      try {
        window.KnrCart.notify(await action());
      } catch (error) {
        const message = (error.status && error.message) || this.dataset.errorMessage;
        try {
          window.KnrCart.notify(await window.KnrCart.refresh());
        } catch {}
        this.showError(message);
      } finally {
        this.setBusy(Boolean(this.isSyncing));
      }
    }

    readSync() {
      const script = this.content?.querySelector('[data-knr-cart-sync]');
      if (!script) return null;

      try {
        return JSON.parse(script.textContent);
      } catch {
        return null;
      }
    }

    async sync() {
      if (this.isSyncing || !this.readSync()) return;
      this.isSyncing = true;
      this.setBusy(true);

      try {
        for (let attempt = 0; attempt < MAX_SYNC_ATTEMPTS; attempt += 1) {
          const payload = this.readSync();
          if (!payload) break;

          const data = payload.add
            ? await window.KnrCart.add(payload.add)
            : await window.KnrCart.update(payload.update);
          window.KnrCart.notify(data);
        }
      } catch {
      } finally {
        this.isSyncing = false;
        this.setBusy(false);
      }
    }

    render(html) {
      if (!html) return;

      const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-knr-cart-drawer-content]');
      const current = this.content;
      if (!fresh || !current) return;

      const focusKey = document.activeElement?.closest('[data-knr-focus]')?.dataset.knrFocus;
      const scrollTop = current.querySelector('.knr-cart-drawer__body')?.scrollTop ?? 0;

      const progress = current.querySelector('[data-knr-cart-progress]');
      const freshProgress = fresh.querySelector('[data-knr-cart-progress]');
      const kept = progress && freshProgress && this.patch(progress, freshProgress) ? progress : null;

      [...current.childNodes].forEach((node) => node !== kept && node.remove());
      const nodes = [...fresh.childNodes];
      const index = kept ? nodes.indexOf(freshProgress) : -1;

      if (index === -1) {
        current.append(...nodes);
      } else {
        kept.before(...nodes.slice(0, index));
        kept.after(...nodes.slice(index + 1));
      }

      const body = current.querySelector('.knr-cart-drawer__body');
      if (body) body.scrollTop = scrollTop;

      if (focusKey && this.dialog.open) {
        const target = current.querySelector(`[data-knr-focus="${CSS.escape(focusKey)}"]`)
          ?? current.querySelector('[data-knr-focus="close"]');
        target?.focus();
      }
    }

    patch(target, source) {
      const targets = [target, ...target.querySelectorAll('[data-knr-patch]')];
      const sources = [source, ...source.querySelectorAll('[data-knr-patch]')];
      if (targets.length !== sources.length) return false;

      targets.forEach((element, index) => {
        const next = sources[index];
        [...element.attributes].forEach(({ name }) => {
          if (!next.hasAttribute(name)) element.removeAttribute(name);
        });
        [...next.attributes].forEach(({ name, value }) => {
          if (element.getAttribute(name) !== value) element.setAttribute(name, value);
        });
        if (next.dataset.knrPatch === 'content' && element.innerHTML !== next.innerHTML) {
          element.innerHTML = next.innerHTML;
        }
      });

      return true;
    }

    setBusy(isBusy) {
      this.isBusy = isBusy;
      this.content?.setAttribute('aria-busy', String(isBusy));
    }

    showError(message) {
      const error = this.content?.querySelector('[data-knr-cart-drawer-error]');
      if (!error) return;

      error.textContent = message;
      error.hidden = !message;
    }
  }

  if (!customElements.get('knr-cart-drawer')) {
    customElements.define('knr-cart-drawer', KnrCartDrawer);
  }
})();
