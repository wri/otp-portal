import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import { getContractSignatureDocumentation } from 'selectors/operators-detail/documentation';

const operator = state => state.operatorsDetail && state.operatorsDetail.data;
const timeline = state => state.operatorsDetail && state.operatorsDetail.timeline;
const user = state => state.user && state.user;

const getParsedTimeline = createSelector(
  operator,
  user,
  timeline,
  getContractSignatureDocumentation,
  (_operator, _user, _timeline, _contract) => {
    const u = _user && (_user.role === 'admin' || (_user.role === 'operator' && _user.operator_ids.includes(_operator.id)))

    if (!u) {
      if (isEmpty(_contract)) return [];
    }

    return _timeline;
  }
);

export { getParsedTimeline };
