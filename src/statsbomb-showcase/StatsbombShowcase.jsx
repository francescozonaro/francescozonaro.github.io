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
          process — it involves considering factors like player quality and
          depth, managerial philosophy, team chemistry, current form and many
          more. The following visuals explore what can be done with Statsbomb's
          official data, reflecting my own curiosity about its potential. The
          code developed to generate these visuals, referencing the free data
          provided by Statsbomb, is available in the{" "}
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
          Mapping the location of certain events on the pitch helps pinpoint
          specific zones where the team executes particular actions, revealing
          patterns that inform tactical decisions. It can cover a single event
          type (e.g. Pressure, Dribble, Shot, etc.) or a group of events (e.g.
          Defensive Actions: Block, Clearance, Interception, Ball Recovery). The
          examples below highlight Italy's pressures and defensive actions
          during the EURO 2020 Final against England. Note that the dotted red
          line marks the average vertical position of each event cluster.
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
          A staple of football analytics, shot maps help identify shooting
          patterns and the spatial distribution of attempts, highlighting teams
          strengths and weaknesses in front of goal. Each shot type (Goal, On
          Target, Off Target) is distinguished by marker shape, with deeper
          color indicating higher xG. The example below shows the shotmap of the
          Euro 2020 Final. Italy's distribution reflects their need to get back
          into the game after Luke Shaw's early goal and their willingness to
          take more risks, while England's suggests a more cautious approach,
          relying on high-quality chances created within the box.
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
          Ball progression — especially in the opponent's half — is one of the
          most valuable skills in modern football. Even when a carry or pass
          doesn't directly create a shooting opportunity, bringing the ball
          forward is fundamental to reach favourable positions where playmakers
          can find that final defence-splitting pass. This plot applies the{" "}
          <a
            href="https://dataglossary.wyscout.com/progressive_pass/"
            target="_blank"
          >
            wyscout definition of Progressive Action
          </a>{" "}
          to determine eligible actions, though other definitions can be applied
          just as easily. The example below shows both attempted and completed
          progressive actions by Federico Chiesa during the Euro 2020 Final.
          Among the players with the most carried meters in the final, Chiesa's
          progressive actions were crucial in Italy's offensive play, as they
          often led to key attacking opportunities, breaking down England's
          defensive structure.
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
          example illustrates the passing networks during the Euro 2020 Final
          between Italy and England. The thickness of the edges is proportional
          to the number of passes exchanged between players and the size of the
          nodes is proportional to the total number of passes attempted by each
          player. Focusing on Italy's network, the plot highlights the central
          role of Jorginho in the build-up play, as well as the significant
          contributions of Verratti and Barella in maintaining possession.
          Additionally, it reveals the heavy involvement of the defensive line
          during build up, with players like Bonucci and Chiellini frequently
          involved in passing sequences.
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
          <a
            href="img/statsbomb-showcase/EnglandPassingNetwork.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/EnglandPassingNetwork.png"
              alt="England Passing Network"
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
          The following plot details the spatial distribution of goalkeeper
          passes in the 2015/16 Premier League season, separating frequency and
          directional tendencies across teams. Each panel represents the
          proportion of goalkeeper distributions landing in specific zones,
          highlighting structural preferences rather than just volume or
          accuracy. A structural split is visible between short-build teams and
          more direct sides. Clubs such as Tottenham, Liverpool, Arsenal and
          Manchester City show higher concentrations in the first and second
          thirds, particularly in wide defensive zones. Their goalkeepers
          distribute shorter, often toward full-backs, maintaining positional
          structure and facilitating controlled build-up. In contrast,
          Leicester, West Brom, Sunderland, Watford and Crystal Palace exhibit
          heavier usage of advanced wide and central zones. This indicates a
          preference for bypassing the first phase entirely. Distribution is
          less about initiating possession sequences and more about contesting
          territory higher up the pitch.
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

      <div className="section-wrapper">
        <div className="visual-title">Goalkeeper Passes Scatterplot</div>
        <div className="visual-description">
          These scatterplots map goalkeeper distribution profiles in the 2015/16
          Premier League season, focusing on three variables: Share of long
          passes (x-axis), Completion rate (y-axis, first figure) and Long
          passes completion rate (y-axis, second figure). As expected, a clear
          negative relationship emerges in the first figure: as the share of
          long passes increases, overall completion drops. Teams such as
          Tottenham, Liverpool, Bournemouth, Everton and Swansea sit toward the
          left side of the chart with relatively low shares of long distribution
          and higher completion rates. On the right side are teams that relied
          heavily on long balls from the goalkeeper. Leicester, West Brom,
          Sunderland, Crystal Palace and Watford show high shares of long passes
          and comparatively low completion rates. Leicester stand out most
          clearly. They exhibit one of the highest long-pass shares in the
          league and the lowest completion rate among the plotted teams. Yet
          this inefficiency in raw completion did not hinder performance
          outcomes, as Leicester won the league that season. Their approach
          under Claudio Ranieri was not designed for sterile possession
          retention. Long distribution often targeted Jamie Vardy or channels
          behind the opposition, prioritising territory, second balls and
          transition speed over pass completion. In this context, a low
          completion percentage is not necessarily a flaw but a feature of a
          risk-seeking vertical strategy.
        </div>

        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/scatterplotShareOfLong_a.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/scatterplotShareOfLong_a.png"
              alt="Premier League 2015/16 Goalkeeper Distribution Scatterplot"
            ></img>
          </a>
          <a
            href="img/statsbomb-showcase/scatterplotShareOfLong_b.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/scatterplotShareOfLong_b.png"
              alt="Premier League 2015/16 Goalkeeper Distribution Scatterplot"
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
