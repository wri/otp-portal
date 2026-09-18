import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Router from 'next/router';
import { useIntl } from 'react-intl';
import classnames from 'classnames';

import Icon from 'components/ui/icon';
import modal from 'services/modal';
import { getSearchFmus } from 'modules/search';
import { SEARCH_OPTIONS } from 'constants/general';
import { mergeExactMatches } from 'utils/search';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from 'utils/recent-searches';

const TYPES = [
  { key: 'producer', icon: 'icon-building', tab: 'search.modal.tabs.producers', tabDefault: 'Producers', label: 'search.modal.type.producer', labelDefault: 'Producer' },
  { key: 'fmu', icon: 'icon-location', tab: 'search.modal.tabs.fmus', tabDefault: 'FMUs', label: 'search.modal.type.fmu', labelDefault: 'FMU' }
];
const TYPE_BY_KEY = Object.fromEntries(TYPES.map(t => [t.key, t]));
const TABS = ['all', ...TYPES.map(t => t.key)];
const PER_GROUP_LIMIT = 5;
const TAB_LIMIT = 30;
const FUSE_OPTIONS = { ...SEARCH_OPTIONS, keys: ['title'] };

const compact = (values) => values.filter(Boolean).join(' · ');

function useSearchIndexes() {
  const operators = useSelector(state => state.operators);
  const { fmus } = useSelector(state => state.search);

  const producers = useMemo(() => operators.data.map(o => ({
    id: `producer-${o.id}`,
    type: 'producer',
    title: o.name,
    sub: o.country?.name,
    href: `/operators/${o.slug}/overview`
  })), [operators.data]);

  const fmuItems = useMemo(() => fmus.data
    .filter(f => f.operator?.slug)
    .map(f => ({
      id: `fmu-${f.id}`,
      type: 'fmu',
      title: f.name,
      sub: compact([f.operator.name, f.country?.name]),
      href: `/operators/${f.operator.slug}/fmus?fmuId=${f.id}`
    })), [fmus.data]);

  return {
    producer: { items: producers, loading: operators.loading },
    fmu: { items: fmuItems, loading: fmus.loading }
  };
}

const SearchModal = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const fmusState = useSelector(state => state.search.fmus);
  const indexes = useSearchIndexes();

  const [Fuse, setFuse] = useState(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [cursor, setCursor] = useState(0);
  // Safe to read storage in the initializer: the modal is loaded with ssr:false
  const [recent, setRecent] = useState(() => getRecentSearches().filter(i => TYPE_BY_KEY[i.type]));
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // .c-modal is still visibility:hidden at mount (it transitions in), so
  // autoFocus is a no-op; retry once the fade-in ends.
  useEffect(() => {
    const input = inputRef.current;
    const focus = () => input.focus();
    focus();
    if (document.activeElement === input) return undefined;

    const modalEl = input.closest('.c-modal');
    if (!modalEl) return undefined;
    modalEl.addEventListener('transitionend', focus, { once: true });
    return () => modalEl.removeEventListener('transitionend', focus);
  }, []);

  useEffect(() => {
    import('fuse.js').then(m => setFuse(() => m.default));
    if (!fmusState.data.length && !fmusState.loading) dispatch(getSearchFmus());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fuses = useMemo(() => {
    if (!Fuse) return {};
    return Object.fromEntries(TYPES.map(({ key }) => [key, new Fuse(indexes[key].items, FUSE_OPTIONS)]));
  }, [Fuse, indexes.producer.items, indexes.fmu.items]);

  const term = query.trim();
  const matches = useMemo(() => Object.fromEntries(TYPES.map(({ key }) => {
    if (!term || !fuses[key]) return [key, []];
    const fuzzy = fuses[key].search(term).map(r => r.item);
    return [key, mergeExactMatches(indexes[key].items, FUSE_OPTIONS.keys, term, fuzzy)];
  })), [term, fuses]);

  const groups = term
    ? TYPES
      .filter(t => tab === 'all' || tab === t.key)
      .map(t => ({ ...t, items: matches[t.key].slice(0, tab === 'all' ? PER_GROUP_LIMIT : TAB_LIMIT) }))
      .filter(g => g.items.length || indexes[g.key].loading)
    : [{ key: 'recent', items: recent }].filter(g => g.items.length);
  const flat = groups.flatMap(g => g.items);

  const onClose = useCallback(() => modal.toggleModal(false), []);

  const onClearRecent = () => {
    clearRecentSearches();
    setRecent([]);
    setCursor(0);
    inputRef.current.focus();
  };

  const onPick = useCallback((item) => {
    addRecentSearch(item);
    modal.toggleModal(false);
    Router.push(item.href).then(() => window.scrollTo(0, 0));
  }, []);

  const selectTab = (key) => {
    setTab(key);
    setCursor(0);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor(c => Math.min(c + 1, flat.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor(c => Math.max(c - 1, 0));
      } else if (e.key === 'Enter' && flat[cursor]) {
        e.preventDefault();
        onPick(flat[cursor]);
      } else if (e.key === 'Tab' && term) {
        e.preventDefault();
        const i = TABS.indexOf(tab);
        selectTab(TABS[(i + (e.shiftKey ? -1 : 1) + TABS.length) % TABS.length]);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [flat, cursor, tab, term, onPick]);

  useEffect(() => {
    const row = listRef.current && listRef.current.querySelector('.search-modal-row.-active');
    if (row) row.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const t = (id, defaultMessage, values) => intl.formatMessage({ id, defaultMessage }, values);
  const tabCount = (key) => {
    if (key === 'all') return TYPES.reduce((sum, { key: k }) => sum + matches[k].length, 0);
    return term && indexes[key].loading ? '…' : matches[key].length;
  };

  // Index of each group's first row in `flat`, for keyboard cursor matching
  const groupOffsets = groups.map((_, gi) => groups.slice(0, gi).reduce((n, g) => n + g.items.length, 0));

  return (
    <div className="c-search-modal" role="dialog" aria-label={t('search.modal.placeholder', 'Search producers and FMUs…')}>
      <div className="search-modal-input">
        <Icon name="icon-search" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          data-test-id="search-modal-input"
          placeholder={t('search.modal.placeholder', 'Search producers and FMUs…')}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
        />
        {query && (
          <button className="search-modal-clear" aria-label="Clear search" onClick={() => setQuery('')}>
            <Icon name="icon-cross" />
          </button>
        )}
        <button className="search-modal-esc" onClick={onClose}>Esc</button>
      </div>

      {term && (
        <div className="search-modal-tabs">
          {TABS.map(key => (
            <button
              key={key}
              className={classnames('search-modal-tab', { '-active': tab === key })}
              onClick={() => selectTab(key)}
            >
              {key === 'all' ? t('search.modal.tabs.all', 'All') : t(TYPES.find(ty => ty.key === key).tab, TYPES.find(ty => ty.key === key).tabDefault)}
              <span className="search-modal-tab-count">{tabCount(key)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="search-modal-list" ref={listRef} data-test-id="search-modal-results">
        {!term && !recent.length && (
          <p className="search-modal-message">
            {t('search.modal.hint', 'Start typing to search producers and FMUs')}
          </p>
        )}

        {term && !flat.length && !groups.length && (
          <p className="search-modal-message">
            {t('search.modal.noresults', 'No matches for “{query}”', { query: term })}
          </p>
        )}

        {groups.map((group, gi) => (
          <div className="search-modal-group" key={group.key}>
            {group.key === 'recent' && (
              <div className="search-modal-group-title">
                {t('search.modal.recent', 'Recent')}
                <button className="search-modal-group-action" data-test-id="search-modal-clear-recent" onClick={onClearRecent}>
                  {t('search.modal.recent.clear', 'Clear')}
                </button>
              </div>
            )}
            {group.key !== 'recent' && tab === 'all' && (
              <div className="search-modal-group-title">{t(group.tab, group.tabDefault)}</div>
            )}
            {!group.items.length && (
              <p className="search-modal-message -small">{t('search.modal.loading', 'Loading…')}</p>
            )}
            {group.items.map((item, j) => {
              const i = groupOffsets[gi] + j;
              const type = TYPE_BY_KEY[item.type];
              return (
                <button
                  key={item.id}
                  className={classnames('search-modal-row', { '-active': cursor === i })}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => onPick(item)}
                >
                  <span className={`search-modal-row-icon -${item.type}`}>
                    <Icon name={type.icon} />
                  </span>
                  <span className="search-modal-row-body">
                    <span className="search-modal-row-title">{item.title}</span>
                    {item.sub && <span className="search-modal-row-sub">{item.sub}</span>}
                  </span>
                  <span className="search-modal-row-right">
                    {item.meta && <span className="search-modal-row-meta">{item.meta}</span>}
                    <span className="search-modal-row-type">{t(type.label, type.labelDefault)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="search-modal-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> {t('search.modal.keys.navigate', 'navigate')}</span>
        <span><kbd>Tab</kbd> {t('search.modal.keys.switch', 'switch type')}</span>
        <span><kbd>↵</kbd> {t('search.modal.keys.open', 'open')}</span>
      </div>
    </div>
  );
};

export default SearchModal;
