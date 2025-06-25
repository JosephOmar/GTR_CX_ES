// // src/components/PrivateRoute.jsx

// import React, { useEffect, useState } from 'react';
// import { isAuthenticated } from './utils/auth';

// const PrivateRoute = ({ children }) => {
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (!isAuthenticated()) {
//       window.location.href = '/login'; // Redirige al login si no está autenticado
//     } else {
//       setIsLoading(false);
//     }
//   }, []);

//   if (isLoading) {
//     return <div>Loading...</div>; // Puedes mostrar un loading mientras verificas la autenticación
//   }

//   return children; // Si está autenticado, renderiza el contenido de la página
// };

// export default PrivateRoute;
