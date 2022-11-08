import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Intl
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

const CountryCard = ({ id, name }) => {
  return (
    <Link href={`/countries/${id}`}>
      <a className="c-country-card">
        <h2 className="c-title -extrabig -uppercase -proximanova"> {name} </h2>
      </a>
    </Link>

  );
}

CountryCard.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string
}

export default injectIntl(connect(
  state => ({
    user: state.user
  })
)(CountryCard));
