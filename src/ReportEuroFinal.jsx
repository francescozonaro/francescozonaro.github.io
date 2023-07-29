import "./ReportEuroFinal.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import goal_test from "./assets/goal_test.svg";

function ReportEuroFinal() {
  const navigate = useNavigate();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="ReportEuroFinal">
      <div className="header">
        <div className="title">
          <strong>StatsbombPlot Showcase:</strong> Italy vs England match report
        </div>
      </div>

      <div id="intro-wrapper">
        <div className="intro-text">
          The following list aims to illustrate all the different types of
          visuals I'm able to produce using Statsbomb data. Every visual can be
          produced taking into consideration one or more matches and one or more
          players, depending on the available data. The following report takes
          into consideration one match (the EURO2020 final between Italy and
          England) and will be performed at team level. Understanding a football
          team's dynamics is hardly a standardized process since it involves
          considering various key factors like players, coach, season form,
          tactics and so on. Any visual in this list should be considered as a
          starting point for a more in-depth analysis, offering flexibility to
          make all the necessary adjustments (different pitch division,
          considering only progressive actions, player specific analysis, time
          based analysis etc.).
        </div>
      </div>

      <div className="visual-wrapper">
        <div className="visual-title">
          Generic event starting location scatterplot
        </div>
        <div className="visual-text">
          Mapping the initial location of certain events on the pitch can be
          highly valuable in pinpointing specific zones where the team executes
          particular actions, enabling strategic analysis and targeted
          performance optimization. It can be a single event type (Pressure,
          Dribble, Shot) or a group of events (Def. Action: Block, Clearance,
          Interception, Ball Recovery).
        </div>
        <div className="visual-img">
          <img
            src="img/ReportEuroFinal/pressuresItaly.png"
            style={{ width: "90%" }}
          ></img>
          <img
            src="img/ReportEuroFinal/defActionItaly.png"
            style={{ width: "90%" }}
          ></img>
        </div>
      </div>

      <div className="visual-wrapper">
        <div className="visual-title">Shotmap</div>
        <div className="visual-text">
          One of the most common type of visuals when analysing a football
          match. It can be helpful when trying to find shooting patterns and can
          offer insights into the spatial distribution of the shots taken by a
          certain team, helping to identify strengths and weaknesses of each
          team. Different shot types (Goal, On Target, Off Target) are
          identified with different markers and the size of the marker is
          directly proportional to the amount of xG associated with the shot.
        </div>
        <div className="visual-img">
          <img
            src="img/ReportEuroFinal/shotmap.png"
            alt="Shotmap Image"
            style={{ width: "90%" }}
          ></img>
        </div>
      </div>

      <div className="visual-wrapper">
        <div className="visual-title">Team Passing Network</div>
        <div className="visual-text">
          A passing network provides insights into team dynamics, player
          interactions, and overall playing strategies. It visualizes passing
          patterns between players during a match, helping to understand how
          possession is distributed and identify key playmakers.
        </div>
        <div className="visual-img">
          <img
            src="img/ReportEuroFinal/ItalyPassingNetwork.png"
            style={{ width: "90%" }}
          ></img>
        </div>
      </div>

      <div id="outro-wrapper">
        <div className="outro-text"></div>

        <div className="outro-links">
          <button
            className="buttonLink"
            onClick={() => navigate("/")}
            style={{ display: "inline-block", width: "50%" }}
          >
            [Portfolio]
          </button>

          <button
            className="buttonLink"
            onClick={() => scrollToTop()}
            style={{ display: "inline-block", width: "50%" }}
          >
            [Back to the top]
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportEuroFinal;
