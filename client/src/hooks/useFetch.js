import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const useFetch = (url) => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (response.ok) {
                    const jsonData = await response.json();
                    setData(jsonData);
                } else {
                    throw new Error('Error fetching data');
                }

            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [url, token])
    return { data, loading, error };
}