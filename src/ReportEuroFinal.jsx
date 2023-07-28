import "./ReportEuroFinal.css";
import React from "react";
import { useNavigate } from 'react-router-dom';
import goal_test from './assets/goal_test.svg';


function ReportEuroFinal() {

  const navigate = useNavigate();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="ReportEuroFinal">
      <div className="header">
        <div className="title">
          Italy vs England
        </div>
      </div>

        <div id="introduction-wrapper">
          <div className="intro-text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>
        </div>

        <img src="img/ReportEuroFinal/shotmap.png" alt="Shotmap Image" style={{width: "45%"}}></img>
        <img src="img/ReportEuroFinal/shotmap.png" alt="Shotmap Image" style={{width: "45%"}}></img>

        <img src="img/ReportEuroFinal/pressuresItaly.png" alt="Shotmap Image" style={{width: "45%"}}></img>
        <img src="img/ReportEuroFinal/pressuresEngland.png" alt="Shotmap Image" style={{width: "45%"}}></img>

        {/* <object type="image/svg+xml" data={goal_test} style={{ width: "100%" }} /> */}

        <div id="outro-wrapper">
          <div className="outro-text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>

          <div className="outro-links">

            <button className="buttonLink" onClick={() => navigate('/')}
            
            style={{ display: "inline-block", width: "50%" }}>[Portfolio]</button>

            <button className="buttonLink" onClick={() => scrollToTop()}
            
            style={{ display: "inline-block", width: "50%" }}>[Back to the top]</button>
          </div>
        </div>
    </div>
  );
}

export default ReportEuroFinal;