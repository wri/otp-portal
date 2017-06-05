import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class Tabs extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: props.defaultSelected
    };

    this.triggerClickSelected = this.triggerClickSelected.bind(this);
  }

  /**
   * UI EVENTS
   * - triggerClickSelected
  */
  triggerClickSelected(selected) {
    this.setState({ selected }, () => {
      this.props.onTabChange && this.props.onTabChange(selected);
    });
  }

  render() {
    const { selected } = this.state;
    const { options } = this.props;

    return (
      <header className="c-static-tabs">
        <div className="l-container">
          <div className="row custom-row">
            {options.map((option) => {
              const btnClasses = classnames({
                '-active': option.value === selected
              });

              return (
                <div
                  key={option.value}
                  className="shrink columns"
                >
                  <button
                    className={`tabs-btn ${btnClasses}`}
                    onClick={() => this.triggerClickSelected(option.value)}
                  >
                    <span className="title">{option.label}</span>
                    {!!option.number && <span className="number">{option.number}</span>}
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

Tabs.propTypes = {
  options: PropTypes.array.isRequired,
  defaultSelected: PropTypes.string,
  onTabChange: PropTypes.func
};
