// Utility functions for handling theme

export const disableDarkMode = () => {
  // Remove any dark mode classes from document
  document.documentElement.classList.remove('dark');
  document.body.classList.remove('dark');
  
  // Clear any theme-related local storage
  localStorage.removeItem('theme');
  localStorage.removeItem('darkMode');
  
  // Update meta theme color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', '#ffffff');
  }
};

// Call this function on app initialization
disableDarkMode();
