import "./StatsbombShowcase.css";
import "../App.css";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function StatsbombShowcase() {
  const navigate = useNavigate();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // State variables for each image section
  const [isVisual1Visible, setIsVisual1Visible] = useState(false);
  const [isVisual2Visible, setIsVisual2Visible] = useState(false);
  const [isVisual3Visible, setIsVisual3Visible] = useState(false);
  const [isVisual4Visible, setIsVisual4Visible] = useState(false);
  const [isVisual5Visible, setIsVisual5Visible] = useState(false);
  const [isVisual6Visible, setIsVisual6Visible] = useState(false);
  const [isVisual7Visible, setIsVisual7Visible] = useState(false);
  const [isVisual8Visible, setIsVisual8Visible] = useState(false);

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
        <button
          className="toggle-button button"
          onClick={() => setIsVisual1Visible(!isVisual1Visible)}
        >
          Show image
        </button>

        <div className={`visual-img ${isVisual1Visible ? "" : "hidden"}`}>
          <img
            src="img/statsbomb-showcase/pressuresItaly.png"
            alt="Pressures Italy"
          ></img>
          <img
            src="img/statsbomb-showcase/defActionItaly.png"
            alt="Defensive Actions Italy"
          ></img>
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
        <button
          className="toggle-button button"
          onClick={() => setIsVisual2Visible(!isVisual2Visible)}
        >
          Show image
        </button>

        <div className={`visual-img ${isVisual2Visible ? "" : "hidden"}`}>
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
            wyscout definition of Progressive Action
          </a>{" "}
          has been used to determine eligible actions, but there are various
          other possible implementations.
        </div>
        <button
          className="toggle-button button"
          onClick={() => setIsVisual3Visible(!isVisual3Visible)}
        >
          Show image
        </button>

        <div className={`visual-img ${isVisual3Visible ? "" : "hidden"}`}>
          <img
            src="img/statsbomb-showcase/chiesaProgressiveAttempted.png"
            alt="Chiesa Progressive Attempted"
          ></img>
          <img
            src="img/statsbomb-showcase/chiesaProgressive.png"
            alt="Chiesa Progressive"
          ></img>
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
        <button
          className="toggle-button button"
          onClick={() => setIsVisual4Visible(!isVisual4Visible)}
        >
          Show image
        </button>

        <div className={`visual-img ${isVisual4Visible ? "" : "hidden"}`}>
          <img
            src="img/statsbomb-showcase/ItalyPassingNetwork.png"
            alt="Italy Passing Network"
          ></img>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Goal Breakdown</div>
        <div className="visual-text">
          A goal breakdown provides a clear understanding of which actions and
          players were involved in the scoring of a goal. Alongside the PNG, a
          table containing each event information is generated too.
        </div>
        <button
          className="toggle-button button"
          onClick={() => setIsVisual5Visible(!isVisual5Visible)}
        >
          Show image
        </button>

        <div className={`visual-img ${isVisual5Visible ? "" : "hidden"}`}>
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
          <img
            src="img/statsbomb-showcase/shawGoal.png"
            alt="Shaw Goal Breakdown"
          ></img>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Shot Frame Freeze</div>
        <div className="visual-text">
          Statsbomb provides detailed data on player positions at the moment of
          a shot, meaning we can evaluate player choices and positioning.
          Although there were no clear-cut missed pass opportunities in the 2021
          Euro final, the example of Luke Shaw's shot demonstrates a
          decision-making moment. Shaw chose to take a low xG shot rather than
          passing to Kalvin Phillips, who was positioned on his right with ample
          space. A pass to Phillips could have led to a more promising scoring
          chance, either through a direct shot or by creating a better
          opportunity given his advantageous position.
        </div>
        <button
          className="toggle-button button"
          onClick={() => setIsVisual6Visible(!isVisual6Visible)}
        >
          Show image
        </button>

        <div className={`visual-img ${isVisual6Visible ? "" : "hidden"}`}>
          <img
            src="img/statsbomb-showcase/englandFrozenShot.png"
            alt="Shot frame freeze"
          ></img>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Goalkeeper Distribution Plot</div>
        <div className="visual-text">
          Statsbomb's data enables the analysis of goalkeeper passing
          distributions, highlighting the contrasting strategies employed by
          England and Italy during the tournament. Gianluigi Donnarumma
          consistently favored short passes to his center-backs, particularly
          during the initial build-up from goal kicks. This approach reflects
          Italy's commitment to maintaining possession and constructing attacks
          from the back, illustrating their preference for controlled passing
          and setting the tone for their overall strategy in the EURO 2020
          final. In contrast, Jordan Pickford utilized more often medium-length
          passes to facilitate quicker transitions, emphasizing a more direct
          upward movement on the field. As could have been anticipated,
          Donnarumma recorded only three long balls in the final, while Pickford
          executed nearly 25. Only successful passes throughout the tournament
          are included in the visuals below.
        </div>
        <button
          className="toggle-button button"
          onClick={() => setIsVisual7Visible(!isVisual7Visible)}
        >
          Show image
        </button>

        <div className={`visual-img ${isVisual7Visible ? "" : "hidden"}`}>
          <img
            src="img/statsbomb-showcase/donnarummaDistribution.png"
            alt="Donnarumma successful passes distribution"
          ></img>
          <img
            src="img/statsbomb-showcase/pickfordDistribution.png"
            alt="Pickford successful passes distribution"
          ></img>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">
          Goals Worth Rewatching: Low xG, High Impact
        </div>
        <div className="visual-text">
          In football, there are moments where analysis takes a back seat, and
          the joy of rewatching beautiful goals becomes the primary focus. The
          table below showcases a collection of goals scored in matches
          involving Italy and England during their path to the final, sorted by
          their expected goals (xG) values. I recommend you to revisit Lorenzo
          Insigne's breathtaking strike against Belgium and Mikkel Damsgaard's
          exceptional free-kick against England. Both goals exemplify how
          football can surprise us and provide unforgettable memories,
          regardless of the statistical analysis behind them.
        </div>
        <button
          className="toggle-button button"
          onClick={() => setIsVisual8Visible(!isVisual8Visible)}
        >
          Show image
        </button>

        <div className={`visual-img ${isVisual8Visible ? "" : "hidden"}`}>
          <img
            src="img/statsbomb-showcase/lowPercShots.png"
            alt="Low xG goals scored"
          ></img>
        </div>
      </div>

      <div id="outro-wrapper">
        <div className="outro-links">
          <button className="button link-button" onClick={() => navigate("/")}>
            Portfolio
          </button>

          <button className="button link-button" onClick={() => scrollToTop()}>
            Back to the top
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatsbombShowcase;
