import React from 'react';
import '../styles/Shows.css';

const Shows = () => {
  const shows = [
    {
      name: 'The Phantom of the Opera',
      time: '7:00 PM',
      date: 'May 20, 2025',
      location: 'Grand Theater, Downtown, Dublin',
      description: 'A timeless classic musical that will leave you mesmerized.',
    },
    {
      name: 'Rock Fest 2025',
      time: '5:00 PM',
      date: 'June 3, 2025',
      location: 'City Arena, Limerick',
      description: 'An electrifying night of rock music featuring top bands.',
    },
    {
      name: 'Stand-Up Comedy Night',
      time: '8:30 PM',
      date: 'June 25, 2025',
      location: 'Comedy Club, Belfast',
      description: 'Laugh out loud with the best comedians in town.',
    },
  ];

  return (
    <div className="whats-on-container">
      <h1 className="title">What's On</h1>
      <div className="shows-list">
        {shows.map((show, index) => (
          <div key={index} className="show-card">
            <h2>{show.name}</h2>
            <p><strong>Date:</strong> {show.date}</p>
            <p><strong>Time:</strong> {show.time}</p>
            <p><strong>Location:</strong> {show.location}</p>
            <p><strong>Description:</strong> {show.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shows;