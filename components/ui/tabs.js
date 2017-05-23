import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class Tabs extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: props.defaultSelected
    };

    // BINDINGS
    this.triggerClickTab = this.triggerClickTab.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selected: nextProps.selected
    });
  }

  triggerClickTab(option) {
    this.setState({
      selected: option.value
    }, () => {
      this.props.onChange && this.props.onChange(this.state.selected);
    });
  }

  render() {
    const { selected } = this.state;
    const { options } = this.props;

    return (
      <header className="c-tabs">
        <div className="l-container">
          <div className="row collapse">
            {options.map((option) => {
              const btnClasses = classnames({
                '-active': option.value === selected
              });

              return (
                <div
                  key={option.value}
                  className={`medium-${12 / options.length} columns`}
                >
                  <button
                    className={`tabs-btn ${btnClasses}`}
                    onClick={() => this.triggerClickTab(option)}
                  >
                    {option.label}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </header>
    );
  }
}

Tabs.defaultProps = {
  options: [{
    label: 'Test',
    value: 'test'
  }, {
    label: 'Test 1',
    value: 'test-1'
  }],
  defaultSelected: 'test'
};

Tabs.propTypes = {
  options: PropTypes.array.isRequired,
  selected: PropTypes.string.isRequired,
  defaultSelected: PropTypes.string.isRequired,
  onChange: PropTypes.func
};
