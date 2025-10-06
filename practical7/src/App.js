// App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

const Sidebar = ({ isOpen, toggleSidebar }) => (
  <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
    <button className="toggle-button" onClick={toggleSidebar}>
      ☰
    </button>
    {isOpen && (
      <nav className="nav-links">
        <Link to="/" onClick={toggleSidebar}>Home</Link>
        <Link to="/depstar" onClick={toggleSidebar}>DEPSTAR CSE</Link>
        <Link to="/cspit" onClick={toggleSidebar}>CSPIT CSE</Link>
        <Link to="/placement" onClick={toggleSidebar}>Placement</Link>
        <Link to="/courses" onClick={toggleSidebar}>Courses</Link>
        <Link to="/faculty" onClick={toggleSidebar}>Faculty</Link>
        <Link to="/about" onClick={toggleSidebar}>About</Link>
      </nav>
    )}
  </div>
);

const Page = ({ title, content }) => (
  <div className="page">
    <h1 className="page-title">{title}</h1>
    {content.map((item, index) => (
      <div key={index} className={`card ${item.type || ''}`}>
        {item.image && (
          <div className="image-center">
            <img src={item.image} alt={item.title} className="logo-img" />
          </div>
        )}
        {item.video && (
          <>
            <h3 className="card-title">{item.title}</h3>
            <div className="video-container">
              <iframe
                src={item.video}
                title={item.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </>
        )}
        {!item.video && <h3 className="card-title">{item.title}</h3>}
        <p>{item.text}</p>
      </div>
    ))}
  </div>
);

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const homeContent = [
  
    {
      video: "https://www.youtube.com/embed/PdpuaQNgDSc",
      title: "Celebrating 25 Years of",
      text: "CHARUSAT Promotional Video showcasing achievements and vision."
    },
    {
      title: "Overview",
      text: "CHARUSAT is a UGC approved University located in Changa, Gujarat. It offers a variety of undergraduate and postgraduate programs focused on innovation and technology."
    }
  ];

  const depstarContent = [
    {
      
      title: "DEPSTAR ",
      text: "DEPSTAR – The institute of modern computing disciplines under CHARUSAT."
    },
    { title: "About DEPSTAR", text: "DEPSTAR is a constituent of CHARUSAT focusing on modern computing disciplines with departments like AI/ML, Cybersecurity, and Data Science." },
    { title: "Programs Offered", text: "B.Tech programs in CSE, IT, AI/ML and specializations like Full Stack, IoT, and DevOps." },
    { title: "Infrastructure", text: "DEPSTAR boasts modern labs, coding rooms, and tech infrastructure with state-of-the-art facilities." },
    { title: "Placements", text: "Top recruiters include TCS, Infosys, and Capgemini with placement training and mock interviews regularly conducted." },
    { title: "Clubs and Activities", text: "Student chapters like CSI, Google DSC, Hackathons, and coding competitions foster tech culture." }
  ];

  const cspitContent = [
    {
      
      title: "CSPIT ",
      text: "CSPIT – The oldest and flagship institute under CHARUSAT."
    },
    { title: "Introduction", text: "CSPIT is the first institute under CHARUSAT, known for its legacy in engineering education since 2000." },
    { title: "Academic Programs", text: "Offers B.Tech in Electrical, EC, Mechanical, Civil and more with updated curriculum and practical focus." },
    { title: "Research & Development", text: "Strong research culture with sponsored projects, technical publications and industry collaborations." },
    { title: "Faculty Excellence", text: "Highly experienced and PhD-qualified faculty guide students in academics and innovation." },
    { title: "Student Life", text: "Annual techfest 'Ingenium', cultural fest 'Bliss', and entrepreneurship development cells enrich student experiences." }
  ];

  const placementContent = [
    { title: "Placement Overview", text: "Over 110 companies visited in 2023–24 with 1200+ student placements and a highest package of ₹23 LPA.", type: "placement" },
    { title: "Top Recruiters", text: "Amazon, TCS, Infosys, ICICI Bank, Capgemini and Amul recruited across various domains.", type: "placement" },
    { title: "CDPC Support", text: "Career Development Cell trains students in aptitude, interviews, internships and soft skills.", type: "placement" }
  ];

  const coursesContent = [
    { title: "Engineering", text: "CSPIT and DEPSTAR offer B.Tech in multiple streams including AI/ML, Data Science, Civil, and Mechanical.", type: "courses" },
    { title: "Computer Applications", text: "CMPICA runs BCA, B.Sc (IT), MCA and M.Sc (IT) with industry-aligned curriculum.", type: "courses" },
    { title: "Science & Humanities", text: "PDPIAS offers B.Sc/M.Sc in Chemistry, Biotech, Physics, and Mathematics with research focus.", type: "courses" },
    { title: "Management", text: "IIIM provides BBA and MBA programs with specializations and high industry connectivity.", type: "courses" }
  ];

  const facultyContent = [
    { title: "CMPICA Faculty", text: "Includes experts in Cloud, AI, Web Mining and Software Development.", type: "faculty" },
    { title: "Engineering Experts", text: "Faculty from CSPIT and DEPSTAR with strong research backgrounds in Robotics, Embedded Systems.", type: "faculty" },
    { title: "Science Faculty", text: "PDPIAS faculty lead students in hands-on training and interdisciplinary research.", type: "faculty" },
    { title: "University-Wide Faculty", text: "Over 1,700 faculty members including many PhDs and industry professionals.", type: "faculty" }
  ];

  const aboutContent = [
    { title: "Accreditation", text: "CHARUSAT is NAAC A+ accredited and ranked among top Indian universities by NIRF and GSIRF." },
    { title: "Vision and Mission", text: "To be a dynamic global institution through knowledge, research, and social contribution." },
    { title: "Campus Life", text: "Spread across 120 acres in Changa, Gujarat, it supports 8,000+ students with high-tech infrastructure." },
    { title: "Institutes", text: "Includes CSPIT, DEPSTAR, CMPICA, IIIM, PDPIAS, RPCP, MTIN, BDPIPS and Faculty of Humanities." },
    { title: "Global Recognition", text: "A UN Academic Impact member and recognized as a Center of Excellence by the Govt. of Gujarat." }
  ];

  return (
    <Router>
      <div className="app">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`main ${!sidebarOpen ? "shifted" : ""}`}>
          <Routes>
            <Route path="/" element={<Page title="CHARUSAT UNIVERSITY" content={homeContent} />} />
            <Route path="/depstar" element={<Page title="DEPSTAR CSE" content={depstarContent} />} />
            <Route path="/cspit" element={<Page title="CSPIT CSE" content={cspitContent} />} />
            <Route path="/placement" element={<Page title="Placement" content={placementContent} />} />
            <Route path="/courses" element={<Page title="Courses" content={coursesContent} />} />
            <Route path="/faculty" element={<Page title="Faculty" content={facultyContent} />} />
            <Route path="/about" element={<Page title="About CHARUSAT" content={aboutContent} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
