import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/videos" element={<Videos />} />
      </Routes>
    </Router>
  );
};

// -------------------- Login --------------------
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      sessionStorage.setItem('loggedInUser', JSON.stringify(user));
      navigate('/upload');
    } else {
      setMessage('Invalid credentials, please try again.');
    }
  };

  return (
    <FormWrapper title="Login">
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <p className="message">{message}</p>
      <p>Don't have an account? <a href="/signup">Sign up here</a></p>
    </FormWrapper>
  );
};

// -------------------- Signup --------------------
const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      setMessage('User with this email already exists!');
      return;
    }
    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    navigate('/login');
  };

  return (
    <FormWrapper title="Sign Up">
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Sign Up</button>
      </form>
      <p className="message">{message}</p>
      <p>Already have an account? <a href="/login">Login here</a></p>
    </FormWrapper>
  );
};

// -------------------- Upload --------------------
const Upload = () => {
  const navigate = useNavigate();
  const [filmName, setFilmName] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = sessionStorage.getItem('loggedInUser');
    if (!user) navigate('/login');
  }, [navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      const videoDetails = {
        filmName,
        directorName,
        contactEmail,
        videoUrl: `http://localhost:5000/video/${data.filename}` // ✅ Streaming anytime
      };

      const uploadedVideos = JSON.parse(sessionStorage.getItem('uploadedVideos')) || [];
      uploadedVideos.push(videoDetails);
      sessionStorage.setItem('uploadedVideos', JSON.stringify(uploadedVideos));

      setMessage('Video uploaded successfully!');
      setFilmName('');
      setDirectorName('');
      setContactEmail('');
      setVideoFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Upload failed. Please try again.');
    }
  };

  return (
    <FormWrapper title="Upload Your Short Film">
      <form onSubmit={handleUpload}>
        <input type="text" placeholder="Film Name" value={filmName} onChange={e => setFilmName(e.target.value)} required />
        <input type="text" placeholder="Director Name" value={directorName} onChange={e => setDirectorName(e.target.value)} required />
        <input type="email" placeholder="Contact Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
        <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} required />
        <button type="submit">Upload</button>
      </form>
      <p className="message" style={{ color: 'green' }}>{message}</p>
      <button onClick={() => navigate('/videos')}>View Uploaded Videos</button>
    </FormWrapper>
  );
};

// -------------------- Videos --------------------
const Videos = () => {
  const navigate = useNavigate();
  const videos = JSON.parse(sessionStorage.getItem('uploadedVideos')) || [];

  return (
    <div className="container">
      <h1>Uploaded Short Films</h1>
      {videos.length === 0 ? (
        <p>No videos uploaded yet.</p>
      ) : (
        videos.map((video, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <h3>{video.filmName} (Director: {video.directorName})</h3>
            <video src={video.videoUrl} controls width="480" />
            <p>Contact: {video.contactEmail}</p>
          </div>
        ))
      )}
      <button onClick={() => navigate('/upload')}>Back to Upload Page</button>
    </div>
  );
};

// -------------------- Form Wrapper --------------------
const FormWrapper = ({ title, children }) => (
  <div className="container" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
    <h1>{title}</h1>
    {children}
  </div>
);

export default App;
