import { createContext, useContext } from 'react';

// The signed-in user, or {} for a visitor. _app owns it: set on the server, cleared on a 401.
export const UserContext = createContext({ user: {}, setUser: () => {} });

export const useUserContext = () => useContext(UserContext);

// Page getInitialProps runs in the browser on client navigation, outside React. _app mirrors the
// user here so those can check it too.
let clientUser = {};
export const getClientUser = () => clientUser;
export const setClientUser = (user) => { clientUser = user; };
