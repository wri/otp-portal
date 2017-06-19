import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

export default function Popup(props) {
  const { title, operator, list } = props;

  const parse = (v) => {
    if (!v || v === 'null') { return '-'; }
    return v;
  };

  return (
    <div className="c-popup">
      <h2 className="c-title -extrabig">{parse(title)}</h2>

      {list && !!list.length &&
        <dl className="dl">
          {list.map(item =>
            <div
              // onClick={() => console.log(item)}
              className="dc"
              key={item.label}
            >
              <dt className="dt">{item.label}:</dt>
              <dd className="dd">{parse(item.value)}</dd>
            </div>
          )}
        </dl>
      }

      {operator && operator.id &&
        <Link href={{ pathname: '/operators-detail', query: { id: operator.id } }} as={`/operators/${operator.id}`}>
          <a className="c-button -tertiary -fullwidth -ellipsis button">
            {operator.name}
          </a>
        </Link>
      }

    </div>
  );
}

Popup.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array
};
