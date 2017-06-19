import React from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import classnames from 'classnames';
import Icon from 'components/ui/icon';

// Constants
import { SEARCH_OPTIONS } from 'constants/general';

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: props.list.length ? props.list.slice(0, props.maxItems) : [],
      value: '',
      activeResults: false,
      index: 0
    };

    this.item = {};

    // Bindings
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this.input.addEventListener('keyup', (e) => {
      switch (e.keyCode) {
        // Arrow up
        case 38: this.setItemSelected('up'); break;
        // Arrow down
        case 40: this.setItemSelected('down'); break;
        // Enter
        case 13: this.onEnterRoute(e); break;
        // ESC
        case 27: this.onClose(); break;
        default: return false;
      }
    });
  }

  onClose() {
    if (this.state.activeResults) {
      this.setState({
        activeResults: false,
        value: ''
      });
      this.input.value = '';
    }
  }

  onKeyUp(e) {
    const fuse = new Fuse(this.props.list, this.props.options);
    const result = fuse.search(e.currentTarget.value);

    this.setState({
      results: result.slice(0, 8),
      activeResults: e.currentTarget.value !== ''
    });
  }

  onClick(e) {
    if (e.target === e.currentTarget) {
      this.onClose();
    }
  }

  onEnterRoute(e) {
    e.preventDefault();
    this.item[this.state.index].click();
  }

  setItemSelected(direction) {
    const { index, results } = this.state;

    if (direction === 'up' && index > 0) {
      this.setState({ index: index - 1 });
    } else if (direction === 'down' && index < results.length - 1) {
      this.setState({ index: index + 1 });
    }
  }

  getResults() {
    const { results } = this.state;

    return (
      <div className="results">
        <div>
          <h1 className="title">Operators</h1>
          <ul>
            {results.length ?
              results.map((op, i) => (
                <li
                  key={i}
                  className={this.state.index === i ? '-active' : ''}
                  data-id={op.id}
                >
                  <a
                    ref={n => this.item[i] = n}
                    href={`/operators/${op.id}`}
                  >
                    {op.name}
                  </a>
                </li>
              )) :
              <li>No results</li>
            }
          </ul>
        </div>
      </div>
    );
  }

  render() {
    const resultsClass = classnames({
      'results-container': true,
      '-active': this.state.activeResults
    });

    return (
      <div className="c-search">
        <div className="">
          <input
            ref={n => this.input = n}
            type="text"
            placeholder={this.props.placeholder}
            onKeyUp={this.onKeyUp}
          />
          <Icon name="icon-search" />
        </div>
        <div
          className={resultsClass}
          ref={n => this.results = n}
          onClick={this.onClick}
        >
          {this.getResults()}
        </div>
      </div>
    );
  }
}

Search.propTypes = {
  list: PropTypes.array,
  placeholder: PropTypes.string,
  maxItems: PropTypes.number,
  options: PropTypes.object
};

Search.defaultProps = {
  list: [],
  maxItems: 8,
  placeholder: 'Search',
  options: SEARCH_OPTIONS
};
