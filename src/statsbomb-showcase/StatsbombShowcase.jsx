import "./StatsbombShowcase.css";
import "../App.css";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function StatsbombShowcase() {
  const navigate = useNavigate();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="StatsbombShowcase">
      <div className="header">
        <div className="mt-8 text-3xl leading-tight tracking-tighter">
          <strong>Plotting Statsbomb Data</strong>
        </div>
      </div>

      <div className="mt-12">
        <div className="leading-6 text-justify">
          Understanding a football team's dynamics is hardly a standardized
          process since it involves considering various key factors like
          players' quality and depth, manager's philosophy, team chemistry,
          tactical adaptability, current form and so on. The following visuals
          are meant to offer a glimpse into what can be done with Statsbomb
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
        <div className="visual-description">
          Mapping the location of certain events on the pitch can be highly
          valuable in pinpointing specific zones where the team executes
          particular actions, enabling strategic analysis and targeted
          performance optimization. It can be a single event type (eg. Pressure,
          Dribble, Shot, etc.) or a group of events (eg. Def. Action: Block,
          Clearance, Interception, Ball Recovery). The following examples
          highlight Italy's pressures and defensive actions during the EURO 2020
          Final against England, with a focus on the mean height of the events,
          which is represented by the dotted red line.
        </div>

        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/pressuresItaly.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/pressuresItaly.png"
              alt="Pressures Italy"
            ></img>
          </a>
          <a
            href="img/statsbomb-showcase/defActionItaly.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/defActionItaly.png"
              alt="Defensive Actions Italy"
            ></img>
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Shotmap</div>
        <div className="visual-description">
          One of the most common visuals when analysing a football match. It can
          be helpful when trying to find shooting patterns and can offer
          insights into the spatial distribution of the shots taken by a certain
          team, helping to identify strengths and weaknesses. In this example,
          different shot types (Goal, On Target, Off Target) are identified with
          different markers. The size of the marker is directly proportional to
          the xG associated with the shot. The following example illustrates the
          shotmap of the Euro 2020 Final. The shot distribution reflects Italy's
          need to get back into the game after Luke Shaw's early goal and their
          willingness to take more risks, while England's shotmap suggests a
          more cautious approach, relying on high-quality chances created within
          the box.
        </div>

        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/shotmap.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/shotmap.png"
              alt="Shotmap Image"
            ></img>
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Progressive actions map</div>
        <div className="visual-description">
          Ball progression is a very valuable skill a player can have,
          especially if performed in the opponent half. Even when the carry/pass
          is not directly creating the opportunity for a shot, bringing the ball
          forward is of course fundamental to reach favourable positions where
          playmakers can find the final defence-splitting pass. Various
          adjustments can be made in what can be considered a slightly more
          refined yet still very simple plot. In this case the{" "}
          <a
            href="https://dataglossary.wyscout.com/progressive_pass/"
            target="_blank"
          >
            wyscout definition of Progressive Action
          </a>{" "}
          has been used to determine eligible actions, but there are various
          other possible implementations. The following example illustrates the
          progressive actions attempted and completed by Federico Chiesa during
          the Euro 2020 Final. One of the players with the most carried meters
          in the final, Chiesa's progressive actions were crucial in Italy's
          offensive play, as they often led to key attacking opportunities and
          helped to break down England's defensive structure.
        </div>

        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/chiesaProgressiveAttempted.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/chiesaProgressiveAttempted.png"
              alt="Chiesa Progressive Attempted"
            ></img>{" "}
          </a>
          <a
            href="img/statsbomb-showcase/chiesaProgressive.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/chiesaProgressive.png"
              alt="Chiesa Progressive"
            ></img>
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Team Passing Network</div>
        <div className="visual-description">
          A passing network provides insights into team dynamics, player
          interactions, and overall playing strategies. It visualizes passing
          patterns between players during a match, helping to understand how
          possession is distributed and identify key playmakers. The following
          example illustrates the passing network of the Italian team during the
          Euro 2020 Final, where the thickness of the edges is proportional to
          the number of passes exchanged between players and the size of the
          nodes is proportional to the total number of passes attempted by each
          player. The plot highlights the central role of Jorginho in Italy's
          build-up play, as well as the significant involvement of players like
          Verratti and Barella in maintaining possession and facilitating ball
          circulation. Additionally, it reveals the strong usage of the
          defensive line during build up, with players like Bonucci and
          Chiellini frequently involved in the passing sequences.
        </div>

        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/ItalyPassingNetwork.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/ItalyPassingNetwork.png"
              alt="Italy Passing Network"
            ></img>
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Goal Breakdown</div>
        <div className="visual-description">
          The goal breakdown provides a clear understanding of which actions and
          players were involved in the making of a goal. Alongside the image, a
          table containing each event information is generated too. The
          following example illustrates the breakdown of Luke Shaw's goal during
          the Euro 2020 Final, where we can see how the goal was the result of a
          well-executed team play, involving multiple players and a series of
          successful actions. The sequence started with a pass from Raheem
          Sterling, followed by a dribble and another pass from Mason Mount,
          which allowed Luke Shaw to advance down the left flank. Shaw then
          executed a successful dribble and pass to Harry Kane, who in turn
          switched the play to Kieran Trippier on the right side. Trippier's
          cross found Shaw in the box, who accompanied the play with a
          well-timed run.
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
        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/shawGoal.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/shawGoal.png"
              alt="Shaw Goal Breakdown"
            ></img>
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Shot Frame Freeze</div>
        <div className="visual-description">
          Statsbomb provides detailed data on player positions at the moment of
          a shot, meaning we can evaluate player choices and positioning.
          Although there were no clear-cut missed pass opportunities in the 2021
          Euro Final, the following example involving one of Luke Shaw's shots
          demonstrates a decision-making moment. Shaw chose to take a low xG
          shot rather than passing to Kalvin Phillips (N. 14), who was
          positioned on his right with ample space. A pass to Phillips could
          have led to a more promising scoring chance, either through a direct
          shot or by creating a better opportunity given his advantageous
          position.
        </div>

        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/englandFrozenShot.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/englandFrozenShot.png"
              alt="Shot frame freeze"
            ></img>
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">
          Goals Worth Rewatching: Low xG, High Impact
        </div>
        <div className="visual-description">
          In football, there are moments where analysis steps aside and the only
          reasonable response is to sit back and enjoy the moment. The table
          below highlights the standout strikes from EURO 2020, ranked not by
          expected goals (xG), but by a custom metric called xBanger, a score
          designed to capture how spectacular a goal was. The calculation starts
          from a simple premise: the lower the xG, the more unexpected the
          finish. For that reason, xBanger is defined as 1 minus the shot's xG
          value. Additional weight is given to goals that required greater
          technical execution. If the shooting technique is anything other than
          “Normal” a small bonus is added. Shot placement is also considered:
          using the shot's end location, the distance to the center of the goal
          is computed and well placed finishes receive an extra boost. The final
          value is rounded to two decimal places. The result is a ranking that
          favors low-probability, technically demanding, and long-range goals —
          in other words, the kind of strikes that feel special the moment they
          hit the net.
        </div>

        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/lowPercShots.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/lowPercShots.png"
              alt="Low xG goals scored"
            ></img>
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Goalkeeper Distribution Plot</div>
        <div className="visual-description">
          Statsbomb's data enables the analysis of goalkeeper passing
          distributions, highlighting the contrasting strategies employed by
          each team during Premier League 2015/16 season. The plot illustrates
          the distribution of successful passes made by goalkeepers and the
          zones of the pitch where these passes were directed. The intensity of
          the color is proportional to the number of successful passes in each
          zone. This plot reveals how different teams utilize their goalkeepers
          in build-up play, with some favoring short passes to defenders while
          others opt for longer distributions to quickly transition into attack.
        </div>

        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/goalkeeperZonalDistribution.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/goalkeeperZonalDistribution.png"
              alt="Donnarumma successful passes distribution"
            ></img>
          </a>
        </div>
      </div>

      <div id="mb-12">
        <div className="flex justify-center space-x-8 mt-12 mb-8">
          <button
            className="button text-secondary w-[150px]"
            onClick={() => navigate("/")}
          >
            Portfolio
          </button>

          <button
            className="button text-secondary w-[150px] "
            onClick={() => scrollToTop()}
          >
            Back to the top
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatsbombShowcase;
