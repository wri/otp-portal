import { useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import dynamic from 'next/dynamic';

const ReduxToastr = dynamic(() => import('react-redux-toastr'), { ssr: false });

const Toastr = () => {
  const store = useStore();
  const toastr = useSelector(state => state.toastr);

  useEffect(() => {
    async function injectReducer() {
      if (!store.asyncReducers.toastr) {
        const { reducer: toastrReducer } = await import('react-redux-toastr');
        store.injectReducer('toastr', toastrReducer);
      }
    }
    injectReducer();
  }, []);

  if (!toastr) return null;

  return <ReduxToastr
    preventDuplicates
    transitionIn="fadeIn"
    transitionOut="fadeOut"
  />;
}

export default Toastr;
