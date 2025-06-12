// src/components/LoadingOrError.tsx
import React from 'react';

interface LoadingOrErrorProps {
  loading?: boolean;
  error?: string | Error;
}

export function LoadingOrError({
  loading = false,
  error,
}: LoadingOrErrorProps) {
  if (loading) {
    return (
      <p className="text-center py-4 text-xs">
        Cargando agentes…
      </p>
    );
  }

  if (error) {
    // Asegurarnos de extraer sólo el mensaje de texto
    const message = typeof error === 'string' ? error : error.message;

    return (
      <p className="text-center py-4 text-red-500 text-xs">
        Error: {message}
      </p>
    );
  }

  return null;
}
