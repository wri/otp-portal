import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import scrollTo from 'animated-scroll-to';

// Redux
import { connect } from 'react-redux';

import { getOperator } from 'modules/operators-detail';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';


class DocumentsByFMU extends React.Component {
  componentDidUpdate() {
    const { data } = this.props;
    const { fmuId } = this.props.query;

    if (fmuId && data.length) scrollTo(this[fmuId]);
  }

  render() {
    const { data, user, id } = this.props;
    const groupedByFmu = HELPERS_DOC.getGroupedByFmu(data);

    return (
      <div className="c-accordion">
        {Object.keys(groupedByFmu).map((fmu) => {
          const groupedByCategory = HELPERS_DOC.getGroupedByCategory(groupedByFmu[fmu]);

          return (
            <div key={fmu} id={fmu} className="accordion-item" ref={(item) => { this[fmu] = item; }}>
              <h3 className="c-title -huge -uppercase accordion-title">{HELPERS_DOC.getFMUName(data, fmu)}</h3>
              <ul className="c-doc-gallery accordion-content">
                {sortBy(Object.keys(groupedByCategory)).map(category => (
                  <li
                    key={category}
                    className="doc-gallery-item"
                  >
                    <header>
                      <h3 className="c-title -proximanova -extrabig -uppercase">{category}</h3>
                    </header>

                    <div className="row l-row -equal-heigth">
                      {sortBy(groupedByCategory[category], doc => doc.title).map(card => (
                        <div
                          key={card.id}
                          className="columns small-12 medium-4"
                        >
                          <DocCard
                            {...card}
                            operatorId={id}
                            onChange={() => this.props.getOperator(id)}
                          />

                          {((user && user.role === 'admin') ||
                           (user && user.role === 'operator' && user.operator && user.operator.toString() === id)) &&
                             <DocCardUpload
                               {...card}
                               operatorId={id}
                               user={user}
                               onChange={() => this.props.getOperator(id)}
                             />
                          }
                        </div>
                        ))}
                    </div>
                  </li>
                  ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }
}

DocumentsByFMU.defaultProps = {
  data: []
};

DocumentsByFMU.propTypes = {
  getOperator: PropTypes.func,
  data: PropTypes.array,
  id: PropTypes.string,
  user: PropTypes.object,
  query: PropTypes.object
};

export default connect(
  state => ({
    user: state.user
  }),
  { getOperator }
)(DocumentsByFMU);
