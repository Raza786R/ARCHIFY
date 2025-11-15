import React, { useState } from 'react';

// This is a simple CSS for the button,
// so we don't need a separate file
const uploaderStyles = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  zIndex: 100,
  backgroundColor: 'white',
  padding: '12px 20px',
  borderRadius: '8px',
  fontFamily: 'sans-serif',
  cursor: 'pointer',
  border: 'none',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
};

const errorStyles = {
  ...uploaderStyles,
  backgroundColor: '#ffaaaa',
  color: 'black',
};

// This component receives a function `onLayoutData`
// It will call this function when it gets new JSON from the AI
export function Uploader({ onLayoutData }) {
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);

    // 1. Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 2. "Fetch" your AI backend
      const response = await fetch('http://127.0.0.1:8000/upload-blueprint/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // 3. Get the JSON response
      const data = await response.json();

      // 4. Check if the AI returned any walls
      if (!data.walls || data.walls.length === 0) {
        throw new Error("AI couldn't find any walls in this image.");
      }

      // 5. SUCCESS! Send the JSON data back to App.jsx
      onLayoutData(data);

    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message);
    }
  };

  // This is a hidden file input, we "click" it with the button
  return (
    <>
      <label style={uploaderStyles} htmlFor="file-upload">
        Upload Blueprint
      </label>
      <input
        id="file-upload"
        type="file"
        style={{ display: 'none' }}
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />
      {error && (
        <div style={errorStyles}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </>
  );
}