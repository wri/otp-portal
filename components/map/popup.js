import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

export default function Popup(props) {
  const { title, list } = props;

  return (
    <div className="c-popup">
      <h2 className="c-title -extrabig">{title}</h2>

      {list && !!list.length &&
        <dl className="dl">
          {list.map(item =>
            <div
              // onClick={() => console.log(item)}
              className="dc"
              key={item.label}
            >
              <dt className="dt">{item.label}:</dt>
              <dd className="dd">{item.value}</dd>
            </div>
          )}
        </dl>
      }

      <Link href={{ pathname: '/operators', query: { id: 26 } }} as="/operators/26">
        <a className="c-button -tertiary -fullwidth button">
          Operator's name
        </a>
      </Link>

    </div>
  );
}

Popup.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array
};
