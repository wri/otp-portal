import React from 'react';
import PropTypes from 'prop-types';

// Next
import Link from 'next/link';
import Router from 'next/router';

// Other libraries
import Fuse from 'fuse.js';
import classnames from 'classnames';

// Components
import Icon from 'components/ui/icon';

// Constants
import { SEARCH_OPTIONS } from 'constants/general';

export default class Search extends React.Component {
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
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWindowClick = this.onWindowClick.bind(this);
    this.onWindowKeyUp = this.onWindowKeyUp.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.active !== this.state.active) {
      if (nextState.active) {
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
        this.onEnter();
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
   * - onEnter
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
    const active = currentValue !== '';

    if (isNewValue) {
      const fuse = new Fuse(this.props.list, this.props.options);
      const result = fuse.search(currentValue);

      this.setState({
        index: 0,
        value: e.currentTarget.value,
        results: result.slice(0, 8),
        active
      });
    }
  }

  onEnter() {
    const id = this.item[this.state.index].dataset.id;

    const location = {
      pathname: '/operators-detail',
      query: { id }
    };

    Router.push(location, `/operators/${id}`);
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

    const resultsClass = classnames({
      'results-container': true,
      '-active': active
    });

    return (
      <div className="c-search">
        <div className="search">
          <input
            ref={(n) => { this.input = n; }}
            type="text"
            placeholder={this.props.placeholder}
            onKeyUp={this.onKeyUp}
          />
          <Icon name="icon-search" />
        </div>
        <div className={resultsClass}>
          <div className="results">
            <h1 className="title">Operators</h1>
            <ul>
              {results.length ?
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
                      <Link
                        href={{ pathname: '/operators-detail', query: { id: op.id } }}
                        as={`/operators/${op.id}`}
                      >
                        <a
                          ref={(n) => { this.item[i] = n; }}
                          data-id={op.id}
                        >
                          {op.name}
                        </a>
                      </Link>
                    </li>
                  );
                }) :
                <li>No results</li>
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

Search.propTypes = {
  list: PropTypes.array,
  placeholder: PropTypes.string,
  options: PropTypes.object
};

Search.defaultProps = {
  list: [],
  placeholder: 'Search',
  options: SEARCH_OPTIONS
};
