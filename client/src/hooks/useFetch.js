import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { getErrorMessage, readApiError } from '../utils/apiError';

export const useFetch = (url) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!url) return;

        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const message = await readApiError(response, 'Failed to fetch data');
                    throw new Error(message);
                }

                const jsonData = await response.json();
                if (!cancelled) setData(jsonData);
            } catch (err) {
                const message = getErrorMessage(err, 'Failed to fetch data');
                if (!cancelled) {
                    setError(message);
                    toast.error(message);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, [url, token]);

    return { data, loading, error };
};
