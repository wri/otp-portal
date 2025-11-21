export default function OperatorsDetail() {
  return null;
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  return {
    redirect: {
      destination: `/operators/${id}/overview`,
      permanent: true,
    },
  };
}
