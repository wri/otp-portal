import { connect } from 'react-redux';

import Component from './component';

export default connect(
  state => ({
    language: state.language
  })
)(Component);
