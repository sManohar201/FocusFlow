import app from "./server";

const PORT = process.env.PORT || 3000;
console.log(`Starting server on port ${PORT}...`);
app.listen(PORT, () => {
  console.log(`Local dev server running at http://localhost:${PORT}`);
});
