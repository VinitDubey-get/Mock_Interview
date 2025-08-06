import { div } from 'framer-motion/client'
import React from 'react'

const SpinnerLoader = () => {
  return (
    <div role="status">
         <svg
        aria-hidden="true"
        className="inline w-5 h-5 text-white animate-spin fill-white"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5C100 78.3 77.6 100.7 49.8 100.7C22 100.7 -0.4 78.3 -0.4 50.5C-0.4 22.7 22 0.3 49.8 0.3C77.6 0.3 100 22.7 100 50.5Z"
          fill="currentColor"
          fillOpacity="0"
        />
        <path
          d="M93.9 39.04C96.4 38.4 97.9 35.9 97 33.5C95.1 28.6 92.2 24.2 88.4 20.4C82.6 14.6 75.1 10.9 66.9 9.8C64.4 9.5 62.1 11.3 61.7 13.8C61.3 16.2 63.1 18.5 65.6 18.9C71.5 19.8 76.9 22.6 81 26.7C83.7 29.4 85.7 32.6 87 36.1C87.9 38.4 91.4 39.6 93.9 39.04Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default SpinnerLoader;