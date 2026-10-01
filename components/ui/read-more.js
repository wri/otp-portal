import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

const ReadMore = ({ children, more, less, lines }) => {
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  // Only a clamped text can be cut off; the observer also fires once when it starts watching.
  useEffect(() => {
    const el = textRef.current;
    if (expanded || !el) return undefined;

    const observer = new ResizeObserver(() => {
      // +1 absorbs sub-pixel line heights
      setTruncated(el.scrollHeight > el.clientHeight + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, children]);

  const toggleLines = (event) => {
    event.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <div className="c-readmore">
      <div
        ref={textRef}
        className={classnames({ "line-clamp": !expanded })}
        style={expanded ? undefined : { WebkitLineClamp: lines }}
      >
        {children}
      </div>
      {(truncated || expanded) && (
        <a href="#" onClick={toggleLines}>
          {expanded ? less : more}
        </a>
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
