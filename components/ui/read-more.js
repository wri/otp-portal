import React, { useState } from "react";
import PropTypes from "prop-types";
import Truncate from "react-truncate";

const ReadMore = ({ children, more, less, lines }) => {
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const handleTruncate = (isTruncated) => {
    if (truncated !== isTruncated) {
      setTruncated(isTruncated);
    }
  };

  const toggleLines = (event) => {
    event.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <div className="c-readmore">
      <Truncate
        lines={!expanded && lines}
        ellipsis={
          <span>
            ...{" "}
            <a href="#" onClick={toggleLines}>
              {more}
            </a>
          </span>
        }
        onTruncate={handleTruncate}
      >
        {children}
      </Truncate>
      {!truncated && expanded && (
        <span>
          {" "}
          <a href="#" onClick={toggleLines}>
            {less}
          </a>
        </span>
      )}
    </div>
  );
};

ReadMore.defaultProps = {
  lines: 3,
  more: "Read more",
  less: "Show less"
};

ReadMore.propTypes = {
  children: PropTypes.node.isRequired,
  lines: PropTypes.number,
  less: PropTypes.string,
  more: PropTypes.string
};

export default ReadMore;
