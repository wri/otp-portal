import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import sortBy from 'lodash/sortBy';

// Redux
import { connect } from 'react-redux';
import Link from 'next/link';
import { setFmuSelected, setAnalysis } from 'modules/operators-detail-fmus';

// Utils
import { HELPERS_FMU } from 'utils/fmu';
import { encode } from 'utils/general';

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
            {sortBy(fmus, 'name').map((fmu) => {
              const isSelected = operatorsDetailFmus.fmu.id === fmu.id;
              const data = operatorsDetailFmus.analysis.data[fmu.id];

              return (
                <li
                  key={fmu.id}
                  className="fmu-item"
                  onClick={() => this.triggerSelectedFmu(fmu)}
                >
                  <div className="fmu-item-header">
                    <span>{fmu.name}</span>

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

                      <ul className="fmu-definition-list">
                        <li>
                          <h3 className="fmu-definition-term">LOSS 2001-2016 with >30% canopy density</h3>
                          <div className="fmu-definition-description">
                            {data && data.loss.toLocaleString()} ha
                          </div>
                        </li>

                        <li>
                          <h3 className="fmu-definition-term">GAIN 2001-2012</h3>
                          <div className="fmu-definition-description">
                            {data && data.gain.toLocaleString()} ha
                          </div>
                        </li>

                        <li>
                          <h3 className="fmu-definition-term">Certifications</h3>
                          <div className="fmu-definition-description">
                            {HELPERS_FMU.getCertifications(fmu)}
                          </div>
                        </li>
                      </ul>

                      <Link href={{ pathname: '/observations', query: { filters: encode({ fmu_id: [Number(fmu.id)] }) } }}>
                        <a className="c-button -primary -fullwidth -ellipsis -small">
                          Observations
                        </a>
                      </Link>
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
