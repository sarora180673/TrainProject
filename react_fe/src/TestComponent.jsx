import { useState, useEffect } from 'react';
import axios from 'axios';

// This is our HOC - it adds a border to any component
function withBorder(WrappedComponent) {
  return function NewComponent(props) {
    return (
      <div style={{ border: '5px solid blue', padding: '10px' }}>
        <WrappedComponent {...props} />
      </div>
    );
  };
}

function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/students');
        //const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/students`);
        console.log(Array.isArray(response.data));
        console.log(response.headers.get('content-type'));
        console.log(response.data);
        const students = Array.isArray(response.data)
          ? response.data
          : response.data?.students ?? response.data?.data ?? [];

        setData(students);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Home Page</h1>
      <h3>User Data JSON</h3>
      {data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <>
           <pre style={{ backgroundColor: 'rgba(21, 20, 22, 0.94)', color: '#f8f8f2', padding: '5px', borderRadius: '5px' }}>
            {JSON.stringify(data, null, 2)}
           </pre>
          {/*<ul>
            {data.map((item, index) => (
              <li key={item._id || `${item.name}-${index}`}>
                {item.name || item.studentName || item.email || JSON.stringify(item)}
              </li>
            ))}
          </ul>*/}
        </>
      )}
    </div>
  );
}

function About() {
  return <h1>About Page</h1>;
}

function Contact() {
  return <h1>Contact Page</h1>;
}

// Create a new component with border
const HomeWithBorder = withBorder(Home);
const AboutWithBorder = withBorder(About);
const ContactWithBorder = withBorder(Contact);

export { HomeWithBorder, AboutWithBorder, ContactWithBorder, Home, About, Contact };
