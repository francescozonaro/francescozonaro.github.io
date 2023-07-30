import "./ReportEuroFinal.css";
import React from "react";
import { useNavigate } from "react-router-dom";

function ReportEuroFinal() {
  const navigate = useNavigate();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="ReportEuroFinal">
      <div className="header">
        <div className="title">
          <strong>Plotting Statsbomb Data:</strong> Italy vs England match
          report
        </div>
      </div>

      <div id="intro-wrapper">
        <div className="intro-text">
          The following list aims to illustrate all the different visuals I'm
          able to produce using Statsbomb data. Every visual can be produced
          taking into consideration one or more matches and one or more players,
          depending on the available data. The following report takes into
          consideration one match (the EURO2020 final between Italy and England)
          and will be performed both at team and player level, depending from
          the specific plot. Understanding a football team's dynamics is hardly
          a standardized process since it involves considering various key
          factors like players, manager, season form, tactics and so on. Any
          visual in this list should be considered as a starting point for a
          more in-depth analysis, offering flexibility to make all the necessary
          adjustments (different pitch division, considering only a subset of
          the main actions, player specific analysis, time based analysis etc.).
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
          performance optimization. It can be a single event type (eg. Pressure,
          Dribble, Shot, etc.) or a group of events (eg. Def. Action: Block,
          Clearance, Interception, Ball Recovery).
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
          One of the most common visuals when analysing a football match. It can
          be helpful when trying to find shooting patterns and can offer
          insights into the spatial distribution of the shots taken by a certain
          team, helping to identify strengths and weaknesses. In this example,
          different shot types (Goal, On Target, Off Target) are identified with
          different markers and the size of the marker is directly proportional
          to the amount of xG associated with the shot.
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
        <div className="visual-title">Progressive actions map</div>
        <div className="visual-text">
          Ball progression is a very valuable skill a player can have,
          especially if performed in the opponent half. Even when the carry/pass
          is not directly creating the opportunity for a shot, bringing the ball
          forward is of course fundamental to reach favourable positions where
          playmakers can find that defence-splitting pass or creative players
          can dribble their way towards the goal. Various adjustments can be
          made in what can be considered a slightly more refined yet still very
          simple plot. In this case the{" "}
          <a
            href="https://dataglossary.wyscout.com/progressive_pass/"
            target="_blank"
          >
            wyscout definion of Progressive Action
          </a>{" "}
          has been used to determine eligible actions, but there are various
          other possible implementations.
        </div>
        <div className="visual-img">
          <img
            src="img/ReportEuroFinal/chiesaProgressiveAttempted.png"
            style={{ width: "90%" }}
          ></img>
          <img
            src="img/ReportEuroFinal/chiesaProgressive.png"
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
