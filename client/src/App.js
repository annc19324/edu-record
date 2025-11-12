// // src/App.js
// import React from 'react';
// import './assets/styles/Home.css'; // Import Home.css
// import Home from './pages/Home';

// function App() {
//   return (
//     <div className="App">
//       <Home />
//     </div>
//   );
// }

// export default App;

// src/App.js
import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import { getUserFromToken } from './services/auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUserFromToken(token)
        .then(setUser)
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  return <Home user={user} setUser={setUser} />;
}

export default App;