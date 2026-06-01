/** @type {import('tailwindcss').Config} */ 
export default { 
  content: [ 
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}", 
  ], 
  theme: { 
    extend: { 
      animation: { 
        'gradient': 'gradient 6s linear infinite', 
      }, 
    }, 
  }, 
  plugins: [], 
} 
