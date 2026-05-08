import { useEffect, useRef, useState } from "react";

/**
 * useGooglePlacesAutocomplete
 * Dynamically loads the Google Maps JS API (with Places library) once.
 * Returns:
 *   - inputRef: attach this to the <input> you want autocomplete on
 *   - place: { address, lat, lng } — updates whenever user selects a suggestion
 */
export function useGooglePlacesAutocomplete() {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [place, setPlace] = useState({ address: "", lat: null, lng: null });

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.warn("VITE_GOOGLE_MAPS_API_KEY not set in .env");
      return;
    }

    // Load Google Maps script only once
    const loadScript = () => {
      if (window.google && window.google.maps) {
        initAutocomplete();
        return;
      }
      if (document.getElementById("google-maps-script")) {
        // Script tag already added, wait for it
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(interval);
            initAutocomplete();
          }
        }, 100);
        return;
      }
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) return;

      // Avoid multiple initializations on the same element
      if (autocompleteRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "in" }, // India only
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const selected = autocompleteRef.current.getPlace();
        if (selected && selected.geometry) {
          const lat = selected.geometry.location.lat();
          const lng = selected.geometry.location.lng();
          const address = selected.formatted_address || "";
          setPlace({ address, lat, lng });
        }
      });
    };

    // Use an interval to check if inputRef.current is available (since it's inside a conditional step)
    const checkInterval = setInterval(() => {
       if (inputRef.current && window.google && window.google.maps) {
          initAutocomplete();
       } else if (!inputRef.current && autocompleteRef.current) {
          // Cleanup if input is unmounted
          autocompleteRef.current = null;
       }
    }, 500);

    loadScript();

    return () => {
      clearInterval(checkInterval);
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  return { inputRef, place };
}
