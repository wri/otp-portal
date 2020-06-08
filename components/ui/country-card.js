import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Intl
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

class CountryCard extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    name: PropTypes.string
  };

  render() {
    const { id, name } = this.props;

    return (
      <Link href={`/countries/${id}`}>
        <a className="c-country-card">
          <h2 className="c-title -extrabig -uppercase -proximanova"> {name} </h2>
        </a>
      </Link>

    );
  }
}

export default injectIntl(connect(
  state => ({
    user: state.user
  })
)(CountryCard));
