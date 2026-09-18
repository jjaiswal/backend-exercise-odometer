import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🎯 Odometer Reading Service running on http://localhost:${PORT}`);
  console.log(`📝 POST /odometer/reading - Extract odometer readings from images`);
  console.log(`💚 GET /health - Health check endpoint`);
});
