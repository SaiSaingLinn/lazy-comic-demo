import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const LazyComicPage = () => {
  const [comicImages, setComicImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Function to fetch comic image data from the mock API with pagination
  const fetchData = async (page) => {
    const limit = 10;
    try {
      const response = await fetch(
        `https://64a29e1bb45881cc0ae56e2d.mockapi.io/api/v1/books?limit=${limit}&page=${page}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  // Function to load more images when reaching the end of the page
  const handleIntersection = async (entries) => {
    if (entries[0].isIntersecting && !loading && hasMoreData) {
      setIsLoadingMore(true); // Set isLoadingMore to true when fetching more data
      setLoading(true);
    }
  };

  useEffect(() => {
    // Create an IntersectionObserver instance
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1,
    });

    // Attach the observer to the bottom of the page
    const target = document.querySelector('#bottom-of-page');
    observer.observe(target);

    // Clean up the observer on unmount
    return () => {
      observer.unobserve(target);
    };
  }, []);

  useEffect(() => {
    // Fetch more images when loading is true (triggered by IntersectionObserver)
    const loadMoreImages = async () => {
      try {
        // Fetch the next set of comic images
        const nextImages = await fetchData(currentPage);
        if (nextImages.length > 0) {
          setComicImages((prevImages) => [...prevImages, ...nextImages]);
          setCurrentPage((prevPage) => prevPage + 1); // Move to the next page
        } else {
          setHasMoreData(false); // If there are no more images, set the flag to false
        }
      } catch (error) {
        console.error('Error fetching more images:', error);
      } finally {
        setIsLoadingMore(false); // Reset the isLoadingMore state after fetching data, regardless of success or failure
        setLoading(false); // Reset the loading state after fetching data, regardless of success or failure
      }
    };

    if (loading) {
      loadMoreImages();
    }
  }, [loading]);

  return (
    <div>
      {/* Header */}
      <header>
        <h1 style={{textAlign: 'center', color: '#FFF'}}>Lazy Comic</h1>
      </header>

      {/* Display Comic Images */}
      {
        comicImages?.length > 0 &&
        <div className="comic-container">
          {comicImages?.map((image) => (
            <div key={image.id} className="comic-image-wrapper">
              {/* Use next/image to render comic image */}
              <Image
                src={image.avatar}
                alt={image.name}
                width={800}
                height={600}
                layout="responsive" // Add responsive layout for the image
                placeholder="blur" // Use the blur effect as the placeholder
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAWElEQVR42mJgKtL9v3/+/5zwAJDUwKMjAxAMTTAxAwMjMwMDFGxgVIAZJG4kmBQMAAI0AYmjLOd6eMAAAAASUVORK5CYII=" // Replace this with your generated blurDataURL
              />
            </div>
          ))}
        </div>
      }

      {/* Display the loading message */}
      {isLoadingMore && <p style={{textAlign: "center", color: '#FFF'}}>Loading...</p>}

      {/* Indicator for the bottom of the page */}
      <div id="bottom-of-page"></div>

      {/* Footer */}
      {/* <footer>
        <p>Lazy Comic - All rights reserved</p>
      </footer> */}
      {/* Add custom CSS styles */}
      <style jsx>{`
        /* Custom CSS for the comic images */
        .comic-image-wrapper {
          /* Set a max width for desktop view (adjust the value as needed) */
          max-width: 800px;
          /* Center the images horizontally */
          margin: 0 auto;
        }

        /* Add any other custom styles you need for the page */
      `}</style>
    </div>
  );
};

export default LazyComicPage;
