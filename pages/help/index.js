const HelpIndex = () => { return null; }

export const getServerSideProps = async ({ req, res }) => {
  return {
    redirect: {
      destination: '/help/overview',
      permanent: false,
    },
  };
}

export default HelpIndex;
