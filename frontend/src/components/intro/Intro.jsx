import React from "react";
import "./Intro.css";

const Intro = () => {
    const stars = Array.from({ length: 120 });
  return (
    <div className="intro-container">
     
      <div className="stars"></div>
      <div className="glow"></div>
      

      <div className="intro-content">

        <h1 className="title">
          SkillSwap <span>AI</span>
        </h1>

        <h2 className="hero-line">
          Learn. Teach. Grow.
        </h2>

        <p className="subtitle">
          Exchange skills. Build connections.
          <br />
          Learn beyond the classroom.
        </p>

      </div>

    </div>
  );
};

export default Intro;