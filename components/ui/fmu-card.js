import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import sortBy from 'lodash/sortBy';

// Redux
import { connect } from 'react-redux';
import { setFmuSelected, setAnalysis } from 'modules/operators-detail-fmus';

// Components
import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';

class FMUCard extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    theme: PropTypes.string,
    fmus: PropTypes.array.isRequired,
    operatorsDetailFmus: PropTypes.object,
    setFmuSelected: PropTypes.func,
    setAnalysis: PropTypes.func
  }

  static defaultProps = {
  }

  triggerSelectedFmu = (fmu) => {
    const { operatorsDetailFmus } = this.props;

    this.props.setFmuSelected(fmu);

    if (!operatorsDetailFmus.analysis.data[fmu.id]) {
      this.props.setAnalysis(fmu);
    }
  }

  render() {
    const { title, theme, fmus, operatorsDetailFmus } = this.props;
    const classNames = classnames({
      [`-${theme}`]: !!theme
    });

    return (
      <div className={`c-fmu-card ${classNames}`}>
        <div className="card-container">

          {title && <h3 className="card-title">{title}</h3>}

          <ul className="fmu-list">
            {sortBy(fmus, 'name').map(fmu => {
              const isSelected = operatorsDetailFmus.fmu.id === fmu.id;

              return (
                <li
                  key={fmu.id}
                  className="fmu-item"
                  onClick={() => this.triggerSelectedFmu(fmu)}
                >
                  <div className="fmu-item-header">
                    {fmu.name}

                    {isSelected &&
                      <Icon name="icon-arrow-up" className="-smaller" />
                    }
                    {!isSelected &&
                      <Icon name="icon-arrow-down" className="-smaller" />
                    }
                  </div>
                  {isSelected &&
                    <div className="fmu-item-content">
                      {!operatorsDetailFmus.analysis.data[fmu.id] &&
                        <Spinner isLoading className="-transparent -tiny" />
                      }

                      <ul>
                        <li>
                          <h3>LOSS 2001-2016 with >30% canopy density</h3>
                          <div>
                            {
                              operatorsDetailFmus.analysis.data[fmu.id] &&
                              operatorsDetailFmus.analysis.data[fmu.id].loss
                            }
                          </div>
                        </li>

                        <li>
                          <h3>GAIN 2001-2012</h3>
                          <div>
                            {
                              operatorsDetailFmus.analysis.data[fmu.id] &&
                              operatorsDetailFmus.analysis.data[fmu.id].gain
                            }
                          </div>
                        </li>
                      </ul>
                    </div>
                  }
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    operatorsDetailFmus: state.operatorsDetailFmus
  }),
  {
    setFmuSelected, setAnalysis
  }
)(FMUCard);
