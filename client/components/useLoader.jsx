import { useEffect, useState } from "react";

export function useLoader(loadingFn) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [error, setError] = useState();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setData(await loadingFn());
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return { loading, data, error };
}
