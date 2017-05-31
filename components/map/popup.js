import React from 'react';

export default function Popup(props = {}, display = []) {
  const fields = Object.keys(props).filter(p => display.includes(p));

  return (
    <div className="c-popup">
      <ul>
        {fields.map(f =>
          <li
            // onClick={() => console.log(f)}
            key={f}
          >
            {f}: {props[f]}
          </li>
        )}
      </ul>
    </div>
  );
}
