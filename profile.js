(function() {
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) Object.assign(node, props);
    if (Array.isArray(children)) children.forEach(function(ch) { if (ch) node.appendChild(ch); });
    return node;
  }

  function text(s) { return document.createTextNode(s); }

  function getSavedSet(key) {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch (_) { return new Set(); }
  }

  function createBookRow(book) {
    return el('div', { className: 'book-row' }, [
      el('img', { src: book.cover, alt: book.title + ' cover' }),
      el('div', null, [
        el('p', { className: 'row-title' }, [text(book.title)]),
        el('p', { className: 'row-meta' }, [text(book.author + ' · ' + book.year)])
      ]),
      el('span', { className: 'badge ' + (book.status === 'taken' ? 'taken' : 'available') }, [text(book.status === 'taken' ? 'Taken' : 'Available')])
    ]);
  }

  document.addEventListener('DOMContentLoaded', function() {
    const byId = Object.fromEntries((window.BOOKS || []).map(function(b) { return [b.id, b]; }));
    const favorites = Array.from(getSavedSet('favorites')).map(function(id) { return byId[id]; }).filter(Boolean);
    const borrowedSet = getSavedSet('borrowed');

    const favoritesList = document.getElementById('favoritesList');
    const borrowedList = document.getElementById('borrowedList');

    if (!favorites.length) {
      favoritesList.appendChild(el('div', { className: 'book-row' }, [
        el('div', { style: 'grid-column: 1 / -1; color: #6b7280;' }, [text('No favorite books yet')])
      ]));
    } else {
      favorites.forEach(function(book) {
        const row = createBookRow(Object.assign({}, book, { status: borrowedSet.has(book.id) ? 'taken' : 'available' }));
        favoritesList.appendChild(row);
      });
    }

    const borrowed = Array.from(borrowedSet).map(function(id) { return byId[id]; }).filter(Boolean);
    if (!borrowed.length) {
      borrowedList.appendChild(el('div', { className: 'book-row' }, [
        el('div', { style: 'grid-column: 1 / -1; color: #6b7280;' }, [text('No borrowed books')])
      ]));
    } else {
      borrowed.forEach(function(book) {
        const row = createBookRow(Object.assign({}, book, { status: 'taken' }));
        borrowedList.appendChild(row);
      });
    }
  });
})();