import Spinner from "./spinner";

export default function DynamicLoading({ isLoading }) {
  return (
    <Spinner isLoading={isLoading} className="-fixed" />
  )
}
