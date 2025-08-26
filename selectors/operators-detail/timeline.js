import { createSelector } from 'reselect';

const operator = state => state.operatorsDetail && state.operatorsDetail.data;
const timeline = state => state.operatorsDetail && state.operatorsDetail.timeline.data;
const user = state => state.user && state.user;

const getParsedTimeline = createSelector(
  operator,
  user,
  timeline,
  (_operator, _user, _timeline) => {
    const contractSigned = _operator && _operator.approved;
    if (contractSigned) return _timeline;
    if (_user && user.role === 'admin') return _timeline;
    if (_user && _user.role === 'operator' && _user.operator_ids.includes(_operator.id)) return _timeline;

    return [];
  }
);

export { getParsedTimeline };
