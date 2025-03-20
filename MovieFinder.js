
import React, { useState, useEffect } from 'react';
import './index.css'; // Import your CSS file
import Spinner from './Spinner'; // Import the Spinner component

const API_KEY = '8c537764'; 

const MovieFinder = () => {
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('Home'); // Default genre set to Home
  const [searchTerm, setSearchTerm] = useState('');
  const [noMoviesFound, setNoMoviesFound] = useState(false);
  const [page, setPage] = useState(1); // Current page for infinite scroll
  const [loading, setLoading] = useState(false); // Loading state
  const [maxPages] = useState(5); // Maximum number of pages to load
  const [isNavbarFixed, setIsNavbarFixed] = useState(false); // State to track navbar position
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to track menu visibility

  const genres = ['Home', 'Horror', 'Comedy', 'Romantic', 'Action', 'Documentary']; // Movie genres

  const fetchMoviesByGenre = async (genre, page) => {
    setLoading(true);
    let response;
    
    if (genre === 'Home') {
      // Fetch a predefined set of movies for the Home genre
      const homeGenres = ['Romantic', 'Horror', 'Action'];
      const moviePromises = homeGenres.map(g => fetch(`https://www.omdbapi.com/?s=${g}&page=${page}&apikey=${API_KEY}`));
      const responses = await Promise.all(moviePromises);
      const data = await Promise.all(responses.map(res => res.json()));
      
      const allMovies = data.flatMap(d => d.Response === "True" ? d.Search : []);
      setMovies(allMovies);
      setNoMoviesFound(allMovies.length === 0);
    } else {
      response = await fetch(`https://www.omdbapi.com/?s=${genre}&page=${page}&apikey=${API_KEY}`);
      const data = await response.json();
      if (data.Response === "True") {
        setMovies((prevMovies) => [...prevMovies, ...data.Search]); // Append new movies to the existing list
        setNoMoviesFound(false); // Reset the message if movies are found
      } else {
        setNoMoviesFound(true); // Set the message if no movies are found
      }
    }
    
    setLoading(false);
  };

  const searchMovies = async (title) => {
    if (!title.trim()) {
      alert("Please enter a movie name."); // Alert if the input is empty
      return; // Exit the function if no input
    }

    const response = await fetch(`https://www.omdbapi.com/?s=${title}&apikey=${API_KEY}`);
    const data = await response.json();
    if (data.Response === "True") {
      setMovies(data.Search);
      setNoMoviesFound(false); // Reset the message if movies are found
    } else {
      setMovies([]);
      setNoMoviesFound(true); // Set the message if no movies are found
    }
  };

  useEffect(() => {
    fetchMoviesByGenre(selectedGenre, page); // Fetch movies when the component mounts or genre changes
  }, [selectedGenre, page]);

  // Handle input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Update the search term

    if (value.trim() === '') {
      // If the input is cleared, fetch movies for the selected genre
      setPage(1); // Reset to the first page
      fetchMoviesByGenre(selectedGenre, 1); // Fetch movies for the selected genre
    }
  };

  // Scroll event handler
  const handleScroll = () => {
    if (window.scrollY > 50) { // Change 50 to the desired scroll position
      setIsNavbarFixed(true);
    } else {
      setIsNavbarFixed(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Only run on mount and unmount

  // Infinite scroll handler
  const handleInfiniteScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !loading && page < maxPages) {
      setPage((prevPage) => prevPage + 1); // Load the next page
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleInfiniteScroll);
    return () => {
      window.removeEventListener('scroll', handleInfiniteScroll);
    };
  }, [loading, page]); // Re-run the effect if loading or page changes

  // Toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle genre click
  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setMovies([]); // Clear the current movies
    setPage(1); // Reset to the first page
    window.scrollTo(0, 0); // Scroll to the top of the page
    fetchMoviesByGenre(genre, 1); // Fetch movies for the selected genre
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className={`navbar ${isNavbarFixed ? 'fixed' : ''}`}>
        <h1 className="logo">MovieFliX</h1> {/* Logo on the left */}
        <ul className="genre-list">
          {genres.map((genre) => (
            <li key={genre} onClick={() => handleGenreClick(genre)}>
              <span className={selectedGenre === genre ? 'active' : ''}>
                {genre}
              </span>
            </li>
          ))}
        </ul>
        <form onSubmit={(e) => { e.preventDefault(); searchMovies(searchTerm); }} className="search-form">
          <input
            type="text"
            placeholder="Search for a movie..."
            value={searchTerm}
            onChange={handleSearchChange} // Use the new change handler
          />
          <button type="submit">Search</button>
        </form>
        {/* Hamburger Icon */}
        <div className="menu" onClick={toggleMenu}>
          <div className="hamburger-icon">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
        </div>
      </nav>

      {loading ? (
        <Spinner /> // Show spinner while loading
      ) : noMoviesFound ? (
        <div className="no-movies-card">
          <h2>😞 Sorry!</h2>
          <p>No Movies found</p>
        </div>
      ) : (
        <div className="movie-grid">
          {movies.map((movie) => (
            <div className="movie-card" key={movie.imdbID}>
              <img 
                src={movie.Poster !== "N/A" ? movie.Poster : 'path/to/placeholder.jpg'} 
                alt={movie.Title} 
              />
              <p className="movie-title">{movie.Title}</p>
              <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + ' trailer')}`, '_blank')}>Trailer</button>
            </div>
          ))}
          {loading && <p>Loading more movies...</p>} {/* Loading indicator */}
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} MovieFliX. All rights reserved.</p>
        <div className="social-icons">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://www.whatsapp.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default MovieFinder;
