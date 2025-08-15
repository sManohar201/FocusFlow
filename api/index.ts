import app from "./server";

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Local dev server running at http://localhost:${PORT}`);
  });
}

// For Vercel
export default app;
