import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className='mb-2'>Welcome to Chatify!</h1>
      <p className='mb-10'>(My portfolio Messenger knock-off!)</p>
      <button className="bg-neutral-500" onClick={() => navigate('/login')}> Go to Login! </button>
    </div>
  );
}