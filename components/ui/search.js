import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Next
import Router from 'next/router';

// Intl
import { injectIntl } from 'react-intl';

// Other libraries
import classnames from 'classnames';

// Components
import Icon from 'components/ui/icon';

// Constants
import { SEARCH_OPTIONS } from 'constants/general';

const Search = ({ list, loading, intl, theme, options }) => {
  const [results, setResults] = useState([]);
  const [value, setValue] = useState('');
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  
  const inputRef = useRef(null);
  const itemRefs = useRef({});

  const onWindowClick = useCallback(() => {
    // TODO: check that you have clicked outside the result container
    if (false) {
      onClose();
    }
  }, []);

  const setIndexByDirection = useCallback((direction) => {
    setIndex(prevIndex => {
      let newIndex = prevIndex;
      switch (direction) {
        case 'up':
          newIndex = (prevIndex === 0) ? results.length - 1 : prevIndex - 1;
          break;
        case 'down':
          newIndex = (prevIndex === results.length - 1) ? 0 : prevIndex + 1;
          break;
        default:
          console.info('No direction provided');
      }
      return newIndex;
    });
  }, [results.length]);

  const onChangeRoute = useCallback(() => {
    const item = itemRefs.current[index];
    if (item) {
      const slug = item.dataset.slug;
      onClose();
      Router.push(`/operators/${slug}/overview`).then(() => window.scrollTo(0, 0));
    }
  }, [index]);

  const onWindowKeyUp = useCallback((e) => {
    switch (e.keyCode) {
      // Arrow up
      case 38:
        setIndexByDirection('up');
        break;
      // Arrow down
      case 40:
        setIndexByDirection('down');
        break;
      // Enter
      case 13:
        onChangeRoute();
        break;
      // ESC
      case 27:
        onClose();
        break;
      default: 
        return false;
    }
    return false;
  }, [setIndexByDirection, onChangeRoute]);

  const onClose = useCallback(() => {
    if (active) {
      setResults([]);
      setValue('');
      setActive(false);
      setIndex(0);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [active]);

  const addListeners = useCallback(() => {
    window.addEventListener('click', onWindowClick);
    window.addEventListener('keyup', onWindowKeyUp);
  }, [onWindowClick, onWindowKeyUp]);

  const removeListeners = useCallback(() => {
    window.removeEventListener('click', onWindowClick);
    window.removeEventListener('keyup', onWindowKeyUp);
  }, [onWindowClick, onWindowKeyUp]);

  const updateSearchResults = useCallback(async (searchText) => {
    const Fuse = (await import('fuse.js')).default;
    const fuse = new Fuse(list, options);
    const result = fuse.search(searchText);

    setIndex(0);
    setValue(searchText);
    setResults(result.map(r => r.item).slice(0, 8));
    setActive(searchText !== '');
  }, [list, options]);

  const onKeyUp = useCallback((e) => {
    const currentValue = e.currentTarget.value;
    const isNewValue = currentValue !== value;

    if (isNewValue) {
      updateSearchResults(currentValue);
    }
  }, [value, updateSearchResults]);

  useEffect(() => {
    if (!loading && value.length) {
      updateSearchResults(value);
    }
  }, [loading, value, updateSearchResults]);

  useEffect(() => {
    if (active) {
      addListeners();
    } else {
      removeListeners();
    }

    return () => {
      removeListeners();
    };
  }, [active, addListeners, removeListeners]);

  useEffect(() => {
    return () => {
      removeListeners();
    };
  }, [removeListeners]);

  const resultsClass = classnames({
    'results-container': true,
    '-active': active
  });

  return (
    <div className={`c-search ${theme}`}>
      <div className="search">
        {!!active &&
          <button
            className="c-button -clean"
            aria-label="Clear search"
            onClick={onClose}
          >
            <Icon name="icon-cross" />
          </button>
        }

        {!active &&
          <Icon name="icon-search" />
        }

        <input
          ref={inputRef}
          type="text"
          size={intl.formatMessage({ id: 'search.operators' }).length + 5}
          placeholder={intl.formatMessage({ id: 'search.operators' })}
          data-test-id="search-input"
          onKeyUp={onKeyUp}
        />
      </div>
      <div className={resultsClass}>
        <div className="results" data-test-id="search-results">
          <ul>
            {loading && (
              <li>
                Loading...
              </li>
            )}
            {!loading && (results.length ?
              results.map((op, i) => {
                const activeClass = classnames({
                  '-active': index === i
                });

                return (
                  <li
                    key={op.id}
                    className={activeClass}
                    onMouseOver={() => { setIndex(i); }}
                  >
                    <a
                      ref={(n) => { itemRefs.current[i] = n; }}
                      data-slug={op.slug}
                      onClick={() => onChangeRoute()}
                    >
                      {op.name}
                    </a>
                  </li>
                );
              }) :
              <li>{intl.formatMessage({ id: 'noresults' })}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

Search.propTypes = {
  theme: PropTypes.string,
  list: PropTypes.array,
  loading: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  options: PropTypes.object
};

Search.defaultProps = {
  theme: '',
  list: [],
  options: SEARCH_OPTIONS
};

export default connect(
  state => ({
    list: state.operators.data,
    loading: state.operators.loading
  })
)(injectIntl(Search));
