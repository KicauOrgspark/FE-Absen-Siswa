import { useState, useCallback } from "react";

type GeoStatus = "idle" | "loading" | "success" | "error";

interface GeoState {
  status: GeoStatus;
  coords: GeolocationCoordinates | null;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    status: "idle",
    coords: null,
    error: null,
  });

  const getLocation = useCallback((): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = "Browser tidak mendukung GPS.";
        setState({ status: "error", coords: null, error: msg });
        return reject(new Error(msg));
      }

      setState({ status: "loading", coords: null, error: null });

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setState({ status: "success", coords: pos.coords, error: null });
          resolve(pos.coords);
        },
        (err) => {
          const messages: Record<number, string> = {
            1: "Izin GPS ditolak. Aktifkan lokasi di browser kamu.",
            2: "Posisi tidak dapat ditentukan.",
            3: "GPS timeout. Coba lagi.",
          };
          const msg = messages[err.code] ?? "GPS error.";
          setState({ status: "error", coords: null, error: msg });
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return { ...state, getLocation };
}