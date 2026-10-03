(() => {
  class KnrProductMain extends HTMLElement {
    connectedCallback() {
      const data = this.querySelector('[data-knr-variants]');
      if (!data) return;

      this.variants = JSON.parse(data.textContent);
      this.addEventListener('change', this.onOptionChange);

      this.querySelectorAll('[data-knr-variant-id]').forEach((input) => {
        input.disabled = false;
      });

      const currentId = Number(this.querySelector('[data-knr-variant-id]')?.value);
      const currentVariant = this.variants.find((variant) => variant.id === currentId);
      if (currentVariant) this.updateStock(currentVariant);
    }

    disconnectedCallback() {
      this.removeEventListener('change', this.onOptionChange);
    }

    onOptionChange = (event) => {
      if (!event.target.matches('[data-knr-option]')) return;

      const variant = this.findSelectedVariant();
      if (!variant) return;

      this.updatePrice(variant);
      this.updateVariantInputs(variant);
      this.updateAddButton(variant);
      this.updateStock(variant);
      this.updateUrl(variant);
      this.showVariantMedia(variant);

      this.dispatchEvent(
        new CustomEvent('knr:variant:change', { bubbles: true, detail: { variant } }),
      );
    };

    findSelectedVariant() {
      const selectedOptions = [...this.querySelectorAll('[data-knr-option]:checked')].map(
        (input) => input.value,
      );

      return this.variants.find((variant) =>
        variant.options.every((option, index) => option === selectedOptions[index]),
      );
    }

    updatePrice(variant) {
      const price = this.querySelector('[data-knr-price]');
      const comparePrice = this.querySelector('[data-knr-compare-price]');
      const unitPrice = this.querySelector('[data-knr-unit-price]');

      if (price) price.textContent = variant.price;

      if (comparePrice) {
        comparePrice.textContent = variant.compareAtPrice ?? '';
        comparePrice.hidden = !variant.compareAtPrice;
      }

      if (unitPrice) {
        unitPrice.textContent = variant.unitPrice;
        unitPrice.hidden = !variant.unitPrice;
      }
    }

    updateVariantInputs(variant) {
      this.querySelectorAll('input[name="id"]').forEach((input) => {
        input.value = variant.id;
      });
    }

    updateAddButton(variant) {
      const button = this.querySelector('[data-knr-add-button]');
      const label = button?.querySelector('[data-knr-add-label]');
      if (!button || !label) return;

      button.disabled = !variant.available;
      label.textContent = variant.available ? button.dataset.labelAdd : button.dataset.labelSoldOut;
    }

    updateStock(variant) {
      const stock = this.querySelector('[data-knr-stock]');
      if (!stock) return;

      if (!variant.available) {
        stock.textContent = stock.dataset.outOfStock;
        return;
      }

      const deliveryDate = addBusinessDays(new Date(), Number(stock.dataset.deliveryDays) || 0);
      const formattedDate = new Intl.DateTimeFormat(document.documentElement.lang, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(deliveryDate);

      stock.textContent = stock.dataset.inStock.replace('[date]', capitalize(formattedDate));
    }

    updateUrl(variant) {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState(window.history.state, '', url);
    }

    showVariantMedia(variant) {
      if (!variant.featuredMediaId) return;

      const list = this.querySelector('.knr-product-gallery__list');
      const item = list?.querySelector(`[data-media-id="${variant.featuredMediaId}"]`);
      if (!list || !item) return;

      list.prepend(item);
      list.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }

  function addBusinessDays(date, days) {
    const result = new Date(date);
    let added = 0;

    while (added < days) {
      result.setDate(result.getDate() + 1);
      const weekDay = result.getDay();
      if (weekDay !== 0 && weekDay !== 6) added += 1;
    }

    return result;
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (!customElements.get('knr-product-main')) {
    customElements.define('knr-product-main', KnrProductMain);
  }
})();
