import { useEffect } from 'react';
import { connect, useStore } from 'react-redux';
import dynamic from 'next/dynamic';

const ReduxToastr = dynamic(() => import('react-redux-toastr'), { ssr: false });

const Toastr = ({ toastr }) => {
  const store = useStore();

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

export default connect((state) => ({ toastr: state.toastr }))(Toastr);
