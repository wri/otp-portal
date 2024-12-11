/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Gallery1 from 'components/operators-detail/overview/gallery-1';

const TotalObservationsByOperatorByCategory = dynamic(() => import('components/operators-detail/observations/by-category'), { ssr: false });

function OperatorsDetailOverview(props) {
  const { address, website, details } = props.operatorsDetail.data;
  const showOverview = address || website || details;

  return (
    <div
      className="c-section"
    >
      <div className="l-container">
        <Gallery1 {...props} />

        {showOverview && (
          <article className="c-article">
            <header>
              <h2 className="c-title">
                {props.intl.formatMessage({ id: 'overview' })}
              </h2>
            </header>
            <div className="content">
              <div className="row l-row -equal-heigth">
                <div className="columns small-12">
                  {Boolean(details) && (
                    <p className="description">
                      {details}
                    </p>
                  )}

                  {(Boolean(address) || Boolean(website)) &&
                    <ul className="details-list">
                      {address &&
                        <li key="address" className="">
                          <span>
                            <strong>{props.intl.formatMessage({ id: 'signup.operators.form.field.address' })}:</strong>
                            <address>{address}</address>
                          </span>
                        </li>
                      }
                      {website &&
                        <li key="website" className="">
                          <strong>{props.intl.formatMessage({ id: 'signup.operators.form.field.website' })}:</strong>
                          <a href={website} target="_blank" rel="noopener noreferrer">{website}</a>
                        </li>
                      }
                    </ul>
                  }
                </div>
              </div>
            </div>
          </article>
        )}

        {/* CHARTS */}
        {props.operatorObservations.length > 0 && (
          <article className="c-article">
            <header>
              <h2 className="c-title">
                {props.intl.formatMessage({ id: 'observations_by_category' })}
              </h2>
            </header>

            <div className="content">
              <TotalObservationsByOperatorByCategory data={props.operatorObservations} />
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

OperatorsDetailOverview.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
  intl: PropTypes.object.isRequired
};


export default injectIntl(OperatorsDetailOverview);
