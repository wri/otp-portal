import React from 'react';
import PropTypes from 'prop-types';

const CookiesTable = ({ cookies }) => (
  <table className="c-cookies-table">
    <thead>
      <tr>
        <th>Classification</th>
        <th>Provider</th>
        <th>Name</th>
        <th>Purpose</th>
      </tr>
    </thead>
    <tbody>
      {cookies.map((cookie) => (
        <tr key={cookie.id}>
          <td>{cookie.classification}</td>
          <td>{cookie.provider}</td>
          <td>{cookie.name}</td>
          <td>{cookie.purpose}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

CookiesTable.propTypes = {
  cookies: PropTypes.array.isRequired
}

export default CookiesTable;
