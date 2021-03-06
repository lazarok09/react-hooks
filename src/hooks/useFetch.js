import { useEffect, useRef, useState } from 'react';

export const useFetch = (url, options) => {
  // be with the result from fetch api
  const [result, setResult] = useState(null);
  // control what will be showed on screen when a fetch request is being made
  const [loading, setLoading] = useState(false);

  // control the useEffect that fetch data for us
  const [shouldLoad, setShouldLoad] = useState(false);
  // let us know what is new and what is not on each fetch request.
  const urlRef = useRef(url);
  const optionsRef = useRef(options);

  // function to compare objects
  const isObjectEqual = (objectA, objectB) => {
    return JSON.stringify(objectA) === JSON.stringify(objectB);
  };

  // watch  url and options, if they change, a new request will be done as side effect.
  useEffect(() => {
    // flag to control the setShouldLoad to prevent double actions
    let isToLoad = false;
    if (!isObjectEqual(url, urlRef.current)) {
      urlRef.current = url;
      isToLoad = true;
    }
    if (!isObjectEqual(options, optionsRef.current)) {
      optionsRef.current = options;
      isToLoad = true;
    }
    if (isToLoad) {
      setShouldLoad((prevState) => !prevState);
    }
  }, [url, options]);

  // useEffect responsável por fazer a fetch
  useEffect(() => {
    // flag to control the componentWillUnMount and clear the fetch promise
    let wait = false;

    console.log('EFFECT', new Date().toLocaleString());

    setLoading(true);

    const controller = new AbortController();
    const signal = controller.signal;
    const fetchData = async () => {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const response = await fetch(urlRef.current, {
          signal,
          ...optionsRef.current,
        });
        const jsonResult = await response.json();
        if (!wait) {
          setResult(jsonResult);
          setLoading(false);
        }
      } catch (e) {
        if (!wait) {
          setLoading(false);
        }
        console.log(e.message);
      }
    };

    fetchData();
    // this make our code don't break when user go to other component without wait a fetch response
    return () => {
      wait = true;
      controller.abort();
    };
  }, [shouldLoad]);

  return [result, loading];
};
