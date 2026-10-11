(() => {
  if (window.KnrCart) return;

  const root = window.Shopify?.routes?.root || '/';

  const getSectionIds = () => [
    ...new Set([...document.querySelectorAll('[data-knr-cart-section]')].map((element) => element.dataset.knrCartSection)),
  ];

  const post = async (path, body = {}) => {
    const response = await fetch(`${root}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...body, sections: getSectionIds(), sections_url: window.location.pathname }),
    });
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(response.status === 422 && data.description ? data.description : '');
      error.status = response.status;
      throw error;
    }

    return data;
  };

  const notify = (data, options = {}) => {
    document.dispatchEvent(
      new CustomEvent('knr:cart:updated', { detail: { sections: data.sections ?? {}, ...options } }),
    );
  };

  const refresh = async () => {
    const response = await fetch(`${root}?sections=${getSectionIds().join(',')}`);
    return { sections: await response.json() };
  };

  window.KnrCart = {
    getSectionIds,
    notify,
    refresh,
    add: (items) => post('cart/add.js', { items }),
    change: (id, quantity) => post('cart/change.js', { id, quantity }),
    update: (payload) => post('cart/update.js', payload),
  };
})();
