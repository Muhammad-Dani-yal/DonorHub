import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="not-found-page">
      <span>404</span>
      <h1>Page not found</h1>
      <p>The page you requested does not exist or has moved.</p>
      <Link to="/">Return home</Link>
    </main>
  );
}

export default NotFound;
