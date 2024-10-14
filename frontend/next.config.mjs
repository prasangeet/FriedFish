// next.config.js
const nextConfig = {
    webpack: (config) => {
      config.experiments = {
        layers: true, // Enable layers experiment
        asyncWebAssembly: true, // If you need async WebAssembly support
      };
    
  
      return config;
    },
    images: {
      domains: ['firebasestorage.googleapis.com'],
    },
  };
  
  export default nextConfig;
  