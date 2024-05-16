import "./StatsbombShowcase.css";
import "../App.css";
import React from "react";
import { useNavigate } from "react-router-dom";

function StatsbombShowcase() {
  const navigate = useNavigate();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="StatsbombShowcase">
      <div className="header">
        <div className="title">
          <strong>Plotting Statsbomb Data:</strong> Italy vs England match
          report
        </div>
      </div>

      <div id="intro-wrapper">
        <div className="intro-text">
          Understanding a football team's dynamics is hardly a standardized
          process since it involves considering various key factors like
          players, manager, season form, tactics and so on. The following list
          aims to illustrate some of the visuals that can be produced using
          Statsbomb official data. The code I've put together for generating
          these visuals can be found in the{" "}
          <a
            href="https://github.com/francescozonaro/statsbombplot"
            target="_blank"
          >
            StatsbombPlot
          </a>{" "}
          repository. It's meant to offer a glimpse into what can be done with
          Statsbomb data, reflecting my own curiosity about its potential
          applications.
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
            src="img/statsbomb-showcase/pressuresItaly.png"
            style={{ width: "90%" }}
          ></img>
          <img
            src="img/statsbomb-showcase/defActionItaly.png"
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
            src="img/statsbomb-showcase/shotmap.png"
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
            src="img/statsbomb-showcase/chiesaProgressiveAttempted.png"
            style={{ width: "90%" }}
          ></img>
          <img
            src="img/statsbomb-showcase/chiesaProgressive.png"
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
            src="img/statsbomb-showcase/ItalyPassingNetwork.png"
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

export default StatsbombShowcase;
