import React from 'react';
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

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: [],
      value: '',
      active: false,
      index: 0
    };

    this.item = {};

    // Bindings
    this.onClose = this.onClose.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWindowClick = this.onWindowClick.bind(this);
    this.onWindowKeyUp = this.onWindowKeyUp.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.loading && prevProps.loading && this.state.value.length) {
      this.updateSearchResults(this.state.value);
    }

    if (this.state.active !== prevState.active) {
      if (this.state.active) {
        this.addListeners();
      } else {
        this.removeListeners();
      }
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  /**
   * WINDOW LISTENERS
   * - onWindowClick
   * - onWindowKeyUp
  */

  onWindowClick() {
    // TODO: check that you have clicked outside the result container
    if (false) {
      this.onClose();
    }
  }

  onWindowKeyUp(e) {
    switch (e.keyCode) {
      // Arrow up
      case 38:
        this.setIndexByDirection('up');
        break;
      // Arrow down
      case 40:
        this.setIndexByDirection('down');
        break;
      // Enter
      case 13:
        this.onChangeRoute();
        break;
      // ESC
      case 27:
        this.onClose();
        break;

      default: return false;
    }

    return false;
  }

  /**
   * UI EVENTS
   * - onKeyUp
   * - onClose
   * - onChangeRoute
  */
  onClose() {
    if (this.state.active) {
      this.setState({
        results: [],
        value: '',
        active: false,
        index: 0
      });
      this.input.value = '';
      this.removeListeners();
    }
  }

  onKeyUp(e) {
    const { value } = this.state;
    const currentValue = e.currentTarget.value;
    const isNewValue = currentValue !== value;

    if (isNewValue) {
      this.updateSearchResults(currentValue);
    }
  }

  onChangeRoute = () => {
    const item = this.item[this.state.index];

    if (item) {
      const slug = item.dataset.slug;
      this.onClose();
      Router.push(`/operators/${slug}/overview`).then(() => window.scrollTo(0, 0));
    }
  }

  setIndexByDirection(direction) {
    const { index, results } = this.state;
    let newIndex = index;

    switch (direction) {
      case 'up':
        newIndex = (index === 0) ? results.length - 1 : index - 1;
        break;
      case 'down':
        newIndex = (index === results.length - 1) ? 0 : index + 1;
        break;

      default:
        console.info('No direction provided');
    }

    this.setIndex(newIndex);
  }

  setIndex(index) {
    this.setState({ index });
  }

  async updateSearchResults(searchText) {
    const Fuse = (await import('fuse.js')).default;
    const fuse = new Fuse(this.props.list, this.props.options);
    const result = fuse.search(searchText);

    this.setState({
      index: 0,
      value: searchText,
      results: result.map(r => r.item).slice(0, 8),
      active: searchText !== ''
    });
  }

  /**
   * HELPERS
   * - addListeners
   * - removeListeners
  */
  addListeners() {
    window.addEventListener('click', this.onWindowClick);
    window.addEventListener('keyup', this.onWindowKeyUp);
  }

  removeListeners() {
    window.removeEventListener('click', this.onWindowClick);
    window.removeEventListener('keyup', this.onWindowKeyUp);
  }

  render() {
    const { active, results } = this.state;
    const { loading } = this.props;

    const resultsClass = classnames({
      'results-container': true,
      '-active': active
    });

    return (
      <div className={`c-search ${this.props.theme}`}>
        <div className="search">
          {!!active &&
            <button
              className="c-button -clean"
              onClick={this.onClose}
            >
              <Icon name="icon-cross" />
            </button>

          }

          {!active &&
            <Icon name="icon-search" />
          }

          <input
            ref={(input) => { this.input = input; }}
            type="text"
            size={this.props.intl.formatMessage({ id: 'search.operators' }).length + 5}
            placeholder={this.props.intl.formatMessage({ id: 'search.operators' })}
            data-test-id="search-input"
            onKeyUp={this.onKeyUp}
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
                    '-active': this.state.index === i
                  });

                  return (
                    <li
                      key={op.id}
                      className={activeClass}
                      onMouseOver={() => { this.setIndex(i); }}
                    >
                      <a
                        ref={(n) => { this.item[i] = n; }}
                        data-slug={op.slug}
                        onClick={() => this.onChangeRoute()}
                      >
                        {op.name}
                      </a>

                    </li>
                  );
                }) :
                <li>{this.props.intl.formatMessage({ id: 'noresults' })}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

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
