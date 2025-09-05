import { useSelector } from "react-redux";

export default function useUser() {
  const user = useSelector((state) => state.user);
  const isLoggedIn = !!user.token;
  const isAdmin = isLoggedIn && user.role === 'admin';
  const isOperator = isLoggedIn && user.role === 'operator';
  const isHolding = isLoggedIn && user.role === 'holding';
  const isGovernment = isLoggedIn && user.role === 'government';

  return {
    ...user,
    isAdmin,
    isOperator,
    isHolding,
    isGovernment,
    isLoggedIn,
    canManageOperator: (operatorId) => isAdmin || ((isOperator || isHolding) && (user.operator_ids || []).includes(Number(operatorId))),
    canManageCountry: (countryId) => isAdmin || (isGovernment && Number(user.country) === Number(countryId))
  };
}
