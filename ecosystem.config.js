
module.exports = {
  apps : [{
    name   : "camisetia", // App name updated
    script : "node_modules/.bin/next", // Command to run Next.js in production
    args   : "start -p 3000",         // Default port for Next.js, change if needed
    cwd    : ".",                     // Current working directory
    instances: 1,                     // Run a single instance, or 'max' to use all CPUs
    autorestart: true,                // Automatically restart if the app crashes
    watch: false,                     // Disable watching files for changes (PM2 handles this differently for Next.js)
    max_memory_restart: '1G',         // Restart if it exceeds this memory limit
    env_production: {
       NODE_ENV: "production",
       // --- RUNWARE API ---
       // Replace with your REAL Runware API Key
       RUNWAY_API_KEY: "xxxxx",
       // This is the general Runware API endpoint for batched tasks.
       // Authentication is now done via apiKey in the request body.
       RUNWAY_API_ENDPOINT: "https://api.runware.ai/v1",

       // --- GOOGLE API (if you still use it for other Genkit flows or Firebase services) ---
       // Replace with your REAL Google API Key
       GOOGLE_API_KEY: "YOUR_ACTUAL_GOOGLE_API_KEY_HERE",

       // Add any other environment variables your application might need for production
       // EXAMPLE_VARIABLE: "example_value"
    }
  }]
};
