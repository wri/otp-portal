import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Image from 'next/image';

export default class StaticSection extends React.Component {

  setPosition() {
    const { position } = this.props;

    return classnames({
      '-top': position.top,
      '-right': position.right,
      '-bottom': position.bottom,
      '-left': position.left
    });
  }

  setJustify() {
    const { position } = this.props;

    return classnames({
      'align-right': position.right
    });
  }

  render() {
    const { children, background, column, className } = this.props;

    return (
      <div
        className={classnames("c-static-section", className)}
      >
        {background && <Image src={background} layout="fill" objectFit="cover" objectPosition="center" />}
        {!!this.props.map &&
          <div className="c-map-container -absolute" type="full">
            {React.cloneElement(this.props.map)}
          </div>
        }

        <div className={`c-static-box ${this.setPosition()}`}>
          <div className="l-container">
            <div className={`row collapse ${this.setJustify()}`}>
              <div className={`columns small-${column}`}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

StaticSection.defaultProps = {
  position: { top: true, left: true },
  column: 12
};

StaticSection.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
  background: PropTypes.string,
  map: PropTypes.any,
  position: PropTypes.object,
  column: PropTypes.number
};
