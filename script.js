(function() {
  function qs(selector, parent) { return (parent || document).querySelector(selector); }
  function qsa(selector, parent) { return Array.from((parent || document).querySelectorAll(selector)); }

  function getSavedSet(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (_) { return new Set(); }
  }

  function saveSet(key, set) {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  }

  function initFavoritesAndBorrowing() {
    const favorites = getSavedSet('favorites');
    const borrowed = getSavedSet('borrowed');

    qsa('.book-card').forEach(function(card) {
      const id = card.getAttribute('data-id');
      const favoriteBtn = qs('.favorite-button', card);
      const takeBtn = qs('.take-button', card);
      const badge = qs('.badge', card);

      // Initialize favorite state
      if (favorites.has(id)) {
        favoriteBtn.classList.add('is-active');
        favoriteBtn.setAttribute('aria-label', 'Remove from favorites');
        favoriteBtn.setAttribute('aria-pressed', 'true');
      }

      // Initialize borrowed state from localStorage OR from data-status
      const initialStatus = card.getAttribute('data-status');
      const isBorrowed = borrowed.has(id) || initialStatus === 'taken';
      if (isBorrowed) {
        card.setAttribute('data-status', 'taken');
        takeBtn.textContent = 'Taken';
        takeBtn.classList.add('is-taken');
        takeBtn.classList.remove('primary');
        takeBtn.classList.add('gray');
        if (badge) { badge.textContent = 'Taken'; badge.classList.remove('available'); badge.classList.add('taken'); }
      } else {
        card.setAttribute('data-status', 'available');
        takeBtn.textContent = 'Take';
        takeBtn.classList.remove('is-taken');
        takeBtn.classList.add('primary');
        takeBtn.classList.remove('gray');
        if (badge) { badge.textContent = 'Available'; badge.classList.add('available'); badge.classList.remove('taken'); }
      }

      // Favorite toggle
      favoriteBtn.addEventListener('click', function() {
        const active = favoriteBtn.classList.toggle('is-active');
        favoriteBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
        favoriteBtn.setAttribute('aria-label', active ? 'Remove from favorites' : 'Add to favorites');
        if (active) favorites.add(id); else favorites.delete(id);
        saveSet('favorites', favorites);
      });

      // Take / Taken toggle
      takeBtn.addEventListener('click', function() {
        const nowTaken = card.getAttribute('data-status') !== 'taken';
        if (nowTaken) {
          card.setAttribute('data-status', 'taken');
          takeBtn.textContent = 'Taken';
          takeBtn.classList.add('is-taken');
          takeBtn.classList.remove('primary');
          takeBtn.classList.add('gray');
          if (badge) { badge.textContent = 'Taken'; badge.classList.remove('available'); badge.classList.add('taken'); }
          borrowed.add(id);
        } else {
          card.setAttribute('data-status', 'available');
          takeBtn.textContent = 'Take';
          takeBtn.classList.remove('is-taken');
          takeBtn.classList.add('primary');
          takeBtn.classList.remove('gray');
          if (badge) { badge.textContent = 'Available'; badge.classList.add('available'); badge.classList.remove('taken'); }
          borrowed.delete(id);
        }
        saveSet('borrowed', borrowed);
        applyFilters();
      });
    });
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function applyFilters() {
    const search = normalize(qs('#searchAll') && qs('#searchAll').value);
    const fTitle = normalize(qs('#filterTitle') && qs('#filterTitle').value);
    const fAuthor = normalize(qs('#filterAuthor') && qs('#filterAuthor').value);
    const fYear = normalize(qs('#filterYear') && qs('#filterYear').value);
    const showAvailable = qs('#statusAvailable') ? qs('#statusAvailable').checked : true;
    const showTaken = qs('#statusTaken') ? qs('#statusTaken').checked : true;

    qsa('.book-card').forEach(function(card) {
      const title = normalize(card.getAttribute('data-title'));
      const author = normalize(card.getAttribute('data-author'));
      const year = normalize(card.getAttribute('data-year'));
      const status = card.getAttribute('data-status');

      // Status filter
      let statusOk = true;
      if (showAvailable && !showTaken) statusOk = status === 'available';
      if (!showAvailable && showTaken) statusOk = status === 'taken';
      if (!showAvailable && !showTaken) statusOk = false; // hide all

      // Year filter: if provided, allow startsWith or exact
      const yearOk = !fYear || year.startsWith(fYear);

      // Title filter
      const titleOk = !fTitle || title.includes(fTitle);

      // Author filter
      const authorOk = !fAuthor || author.includes(fAuthor);

      // Global search (title or author)
      const searchOk = !search || title.includes(search) || author.includes(search);

      const visible = statusOk && yearOk && titleOk && authorOk && searchOk;
      card.classList.toggle('hidden', !visible);
    });
  }

  function initFilters() {
    ['#searchAll', '#filterTitle', '#filterAuthor', '#filterYear', '#statusAvailable', '#statusTaken'].forEach(function(sel) {
      const el = qs(sel);
      if (!el) return;
      const ev = el.tagName === 'INPUT' && el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(ev, applyFilters);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initFavoritesAndBorrowing();
    initFilters();
    applyFilters();
  });
})();