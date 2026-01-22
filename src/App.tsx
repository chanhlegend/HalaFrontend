import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppRoute } from './routes';
import { isAuthenticated } from './services/authService';
import './App.css';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {AppRoute.map((route, index) => {
          const Page = route.page;
          const Layout = route.layout || React.Fragment;

          return (
            <Route
              key={index}
              path={route.path}
              element={
                route.isProtected && !isAuthenticated() ? (
                  <Navigate to="/auth" replace />
                ) : (
                  <Layout>
                    <Page />
                  </Layout>
                )
              }
            />
          );
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
