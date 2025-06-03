
"use client";

import { useEffect } from 'react';
import { getFirebaseAnalytics } from '@/lib/firebase';

export default function FirebaseAnalyticsInitializer() {
  useEffect(() => {
    const initializeAnalytics = async () => {
      const analyticsInstance = await getFirebaseAnalytics();
      if (analyticsInstance) {
        console.log("Firebase Analytics está activo y recolectando datos.");
        // Google Analytics for Firebase automatically logs page_view events for SPAs
        // when correctly configured with a measurementId.
      } else {
        console.log("Firebase Analytics no es compatible con este navegador o no se pudo inicializar.");
      }
    };
    initializeAnalytics();
  }, []);

  return null; // This component does not render anything
}
