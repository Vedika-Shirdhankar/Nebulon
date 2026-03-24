import React from "react";
import Landing from "./pages/Landing"; // Make sure the path matches your folder structure
import Footer from "./components/ui/Footer"; // The footer we just made

function App() {
  return (
    <div className="bg-gray-950 min-h-screen selection:bg-green-500/30">
      {/* The main landing page content */}
      <Landing />

      {/* The Footer stays at the bottom of the page */}
      <Footer />
    </div>
  );
}

export default App;