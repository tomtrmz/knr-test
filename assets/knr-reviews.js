(() => {
  class KnrReviews extends HTMLElement {
    connectedCallback() {
      this.items = [...this.querySelectorAll('[data-knr-reviews-item]')];
      this.checkboxes = [...this.querySelectorAll('[data-knr-reviews-filter]')];
      this.rows = [...this.querySelectorAll('[data-knr-reviews-rating]')];
      this.moreButton = this.querySelector('[data-knr-reviews-more]');
      this.emptyMessage = this.querySelector('[data-knr-reviews-empty]');
      this.perPage = Number(this.dataset.perPage) || 3;
      this.visibleCount = this.perPage;

      this.addEventListener('change', this.onChange);
      this.addEventListener('click', this.onClick);
      this.update();
    }

    disconnectedCallback() {
      this.removeEventListener('change', this.onChange);
      this.removeEventListener('click', this.onClick);
    }

    getSelectedRatings() {
      return this.checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
    }

    onChange = (event) => {
      if (!event.target.matches('[data-knr-reviews-filter]')) return;
      this.visibleCount = this.perPage;
      this.update();
    };

    onClick = (event) => {
      const row = event.target.closest('[data-knr-reviews-rating]');
      if (row) {
        const checkbox = this.checkboxes.find((input) => input.value === row.dataset.knrReviewsRating);
        if (checkbox) checkbox.checked = !checkbox.checked;
        this.visibleCount = this.perPage;
        this.update();
        return;
      }

      if (event.target.closest('[data-knr-reviews-more]')) {
        const firstNew = this.getMatchingItems()[this.visibleCount];
        this.visibleCount += this.perPage;
        this.update();

        firstNew?.setAttribute('tabindex', '-1');
        firstNew?.focus({ preventScroll: true });
      }
    };

    getMatchingItems() {
      const ratings = this.getSelectedRatings();
      return this.items.filter((item) => ratings.length === 0 || ratings.includes(item.dataset.rating));
    }

    update() {
      const ratings = this.getSelectedRatings();
      const matching = this.getMatchingItems();

      this.items.forEach((item) => {
        const index = matching.indexOf(item);
        item.hidden = index === -1 || index >= this.visibleCount;
      });

      this.rows.forEach((row) => {
        row.setAttribute('aria-pressed', String(ratings.includes(row.dataset.knrReviewsRating)));
      });

      if (this.moreButton) this.moreButton.hidden = matching.length <= this.visibleCount;
      if (this.emptyMessage) this.emptyMessage.hidden = matching.length > 0;
    }
  }

  if (!customElements.get('knr-reviews')) {
    customElements.define('knr-reviews', KnrReviews);
  }
})();
