import { useEffect } from 'react';

// why title cannot be destructured? because it's not an object
const useTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;

    document.title = title;

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default useTitle;
