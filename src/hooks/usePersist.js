import { useState, useEffect } from 'react';

/**
 * A custom React hook for persisting state in the browser's localStorage.
 * It functions similarly to useState, but will sync the state with
 * the value in localStorage, so that the state persists even after a page refresh.
 *
 * @returns {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
 *          A tuple containing the persistent state and its setter function.
 */
const usePersist = () => {
  // Initialize the state by checking localStorage.
  // It retrieves the 'persist' item, parses it from a JSON string,
  // and falls back to `false` if the item doesn't exist or is invalid.
  const [persist, setPersist] = useState(
    () => JSON.parse(localStorage.getItem('persist')) || false
  );

  // Use useEffect to synchronize the state with localStorage.
  // The effect is triggered whenever the `persist` state variable changes.
  useEffect(() => {
    // Stringify the boolean state and save it to localStorage under the key 'persist'.
    localStorage.setItem('persist', JSON.stringify(persist));
  }, [persist]);

  // Return the state variable and its setter, just like the built-in useState hook.
  return [persist, setPersist];
};

export default usePersist;
