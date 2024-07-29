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
          it's meant to offer a glimpse into what can be done with Statsbomb
          official data, reflecting my own curiosity about its potential
          applications. The code developed to generate these visuals, utilizing
          the free data provided by Statsbomb, is available in the{" "}
          <a
            href="https://github.com/francescozonaro/statsbombplot"
            target="_blank"
          >
            StatsbombPlot
          </a>{" "}
          repository.
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Generic events scatterplot</div>
        <div className="visual-text">
          Mapping the location of certain events on the pitch can be highly
          valuable in pinpointing specific zones where the team executes
          particular actions, enabling strategic analysis and targeted
          performance optimization. It can be a single event type (eg. Pressure,
          Dribble, Shot, etc.) or a group of events (eg. Def. Action: Block,
          Clearance, Interception, Ball Recovery).
        </div>
        <div className="visual-img">
          <img src="img/statsbomb-showcase/pressuresItaly.png"></img>
          <img src="img/statsbomb-showcase/defActionItaly.png"></img>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Shotmap</div>
        <div className="visual-text">
          One of the most common visuals when analysing a football match. It can
          be helpful when trying to find shooting patterns and can offer
          insights into the spatial distribution of the shots taken by a certain
          team, helping to identify strengths and weaknesses. In this example,
          different shot types (Goal, On Target, Off Target) are identified with
          different markers and the size of the marker is directly proportional
          to the xG associated with the shot.
        </div>
        <div className="visual-img">
          <img
            src="img/statsbomb-showcase/shotmap.png"
            alt="Shotmap Image"
          ></img>
        </div>
      </div>

      <div className="section-wrapper">
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
          <img src="img/statsbomb-showcase/chiesaProgressiveAttempted.png"></img>
          <img src="img/statsbomb-showcase/chiesaProgressive.png"></img>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Team Passing Network</div>
        <div className="visual-text">
          A passing network provides insights into team dynamics, player
          interactions, and overall playing strategies. It visualizes passing
          patterns between players during a match, helping to understand how
          possession is distributed and identify key playmakers.
        </div>
        <div className="visual-img">
          <img src="img/statsbomb-showcase/ItalyPassingNetwork.png"></img>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Goal Breakdown</div>
        <div className="visual-text">
          A goal breakdown provides a clear understanding of which actions and
          players were involved in the scoring of a goal. Instad of cluttering
          the image with text, each actions (circle/line) has a text associated{" "}
          <strong>that shows only on hover</strong>. Alongside the SVG, a table
          containing each event information is generated too.
        </div>
        <div className="visual-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Time</th>
                <th>Player</th>
                <th>Action</th>
                <th>Outcome</th>
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0</td>
                <td>1m36s</td>
                <td>Raheem Sterling</td>
                <td>pass</td>
                <td>success</td>
                <td>England</td>
              </tr>
              <tr>
                <td>1</td>
                <td>1m39s</td>
                <td>Mason Mount</td>
                <td>dribble</td>
                <td>success</td>
                <td>England</td>
              </tr>
              <tr>
                <td>2</td>
                <td>1m40s</td>
                <td>Mason Mount</td>
                <td>pass</td>
                <td>success</td>
                <td>England</td>
              </tr>
              <tr>
                <td>3</td>
                <td>1m41s</td>
                <td>Luke Shaw</td>
                <td>dribble</td>
                <td>success</td>
                <td>England</td>
              </tr>
              <tr>
                <td>4</td>
                <td>1m44s</td>
                <td>Luke Shaw</td>
                <td>pass</td>
                <td>success</td>
                <td>England</td>
              </tr>
              <tr>
                <td>5</td>
                <td>1m45s</td>
                <td>Harry Kane</td>
                <td>dribble</td>
                <td>success</td>
                <td>England</td>
              </tr>
              <tr>
                <td>6</td>
                <td>1m49s</td>
                <td>Harry Kane</td>
                <td>pass</td>
                <td>success</td>
                <td>England</td>
              </tr>
              <tr>
                <td>7</td>
                <td>1m52s</td>
                <td>Kieran Trippier</td>
                <td>dribble</td>
                <td>success</td>
                <td>England</td>
              </tr>
              <tr>
                <td>8</td>
                <td>1m55s</td>
                <td>Kieran Trippier</td>
                <td>cross</td>
                <td>success</td>
                <td>England</td>
              </tr>
              <tr>
                <td>9</td>
                <td>1m57s</td>
                <td>Luke Shaw</td>
                <td>shot</td>
                <td>success</td>
                <td>England</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="visual-img">
          <object
            type="image/svg+xml"
            data="img/statsbomb-showcase/shawGoal.svg"
          >
            Your browser does not support SVG.
          </object>
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
