import "./StatsbombShowcase.css";

import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

function StatsbombShowcase() {
  const navigate = useNavigate();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="StatsbombShowcase">
      <PageHeader className="mt-8">
        <strong>Football Analytics with StatsBomb Data</strong>
      </PageHeader>

      <div className="mt-12">
        <div className="leading-6 text-justify">
          Evaluating a football team is a multi-dimensional problem: player
          quality and depth, managerial philosophy, cohesion and current form
          all play a part. This page presents a series of visualisations built
          on StatsBomb's open event data, illustrating the kinds of analysis it
          supports. The source code is available in the{" "}
          <a
            href="https://github.com/francescozonaro/statsbombplot"
            target="_blank"
            rel="noopener noreferrer"
          >
            StatsBombPlot
          </a>{" "}
          repository.
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Event Scatterplot</div>
        <div className="visual-description">
          Plotting the location of events on the pitch identifies the zones in
          which a team performs specific actions and reveals tactical patterns.
          The analysis can cover a single event type (e.g. Pressure, Dribble,
          Shot) or a group of events (e.g. Defensive Actions: Block, Clearance,
          Interception, Ball Recovery). The examples show Italy's pressures and
          defensive actions in the EURO 2020 Final against England. The dotted
          red line marks the average vertical position of each event cluster.
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
            />
          </a>
          <a
            href="img/statsbomb-showcase/defActionItaly.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/defActionItaly.png"
              alt="Defensive Actions Italy"
            />
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Shotmap</div>
        <div className="visual-description">
          Shot maps are a staple of football analytics: they show where a team's
          attempts originate and how they are distributed, highlighting
          strengths and weaknesses in front of goal. Marker shape denotes the
          outcome (Goal, On Target, Off Target) and darker colour indicates
          higher xG. The example covers the EURO 2020 Final. Italy's
          distribution reflects the need to respond after Luke Shaw's early
          goal and a greater willingness to take risks, whereas England's
          suggests a more conservative approach built on high-quality chances
          created inside the box.
        </div>

        <div className="visual-previews">
          <a
            href="img/statsbomb-showcase/shotmap.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="img/statsbomb-showcase/shotmap.png" alt="Shotmap Image" />
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Progressive Actions Map</div>
        <div className="visual-description">
          Ball progression, particularly in the opponent's half, is one of the
          most valuable skills in modern football. Even when a carry or pass
          does not directly create a shot, advancing the ball is essential to
          reach positions from which playmakers can deliver the final,
          defence-splitting pass. This plot applies the{" "}
          <a
            href="https://dataglossary.wyscout.com/progressive_pass/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wyscout definition of progressive actions
          </a>{" "}
          to identify eligible actions, although other definitions can be
          substituted easily. The example shows Federico Chiesa's attempted and
          completed progressive actions in the EURO 2020 Final. Chiesa was among
          the players who carried the ball the furthest, and his progressive
          actions were central to Italy's attacking play, frequently creating
          chances and disrupting England's defensive structure.
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
            />{" "}
          </a>
          <a
            href="img/statsbomb-showcase/chiesaProgressive.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/chiesaProgressive.png"
              alt="Chiesa Progressive"
            />
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Team Passing Network</div>
        <div className="visual-description">
          A passing network shows how players interact and how possession is
          distributed, helping to identify a team's key playmakers and overall
          playing style. The example presents both teams' networks from the
          EURO 2020 Final. Edge thickness is proportional to the number of
          passes exchanged between two players, and node size to the total
          passes attempted by each player. Italy's network highlights
          Jorginho's central role in build-up, with Verratti and Barella
          contributing significantly to possession. It also shows the heavy
          involvement of the defensive line, with Bonucci and Chiellini
          frequently featuring in passing sequences.
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
            />
          </a>
          <a
            href="img/statsbomb-showcase/EnglandPassingNetwork.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/EnglandPassingNetwork.png"
              alt="England Passing Network"
            />
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Goal Breakdown</div>
        <div className="visual-description">
          The goal breakdown traces the actions and players involved in the
          build-up to a goal; a table with the details of each event
          accompanies the image. The example is Luke Shaw's goal in the EURO
          2020 Final, the product of a well-executed team move. The sequence
          began with a pass from Raheem Sterling, followed by a dribble and a
          pass from Mason Mount, which allowed Shaw to advance down the left
          flank. Shaw then dribbled and passed to Harry Kane, who switched play
          to Kieran Trippier on the right. Trippier's cross found Shaw, who had
          made a well-timed run into the box.
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
            />
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Shot Frame Freeze</div>
        <div className="visual-description">
          StatsBomb records player positions at the moment of each shot, which
          makes it possible to assess decision-making. The EURO 2020 Final
          contains no clear-cut missed passing opportunities, but the example
          below, one of Luke Shaw's shots, illustrates a decision point. Shaw
          opted for a low-xG shot rather than passing to Kalvin Phillips (No.
          14), who was positioned on his right with ample space. A pass to
          Phillips could have produced a better chance, either directly or by
          creating a more favourable situation given his position.
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
            />
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">
          Low-xG Goals: Ranking Spectacular Finishes
        </div>
        <div className="visual-description">
          This table ranks the standout goals of EURO 2020 not by expected goals
          (xG) but by a custom metric, xBanger, designed to quantify how
          spectacular a goal was. The metric starts from the premise that the
          lower the xG, the more unexpected the finish, and is therefore
          defined as 1 minus the shot's xG. Goals requiring greater technical
          execution receive additional weight: a small bonus is added when the
          shooting technique is anything other than “Normal”. Shot placement is
          also considered: the distance between the shot's end location and the
          centre of the goal is computed, and well-placed finishes receive a
          further bonus. The final value is rounded to two decimal places. The
          resulting ranking favours low-probability, technically demanding and
          long-range goals.
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
            />
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Goalkeeper Distribution Zones</div>
        <div className="visual-description">
          This plot shows the spatial distribution of goalkeeper passes in the
          2015/16 Premier League season. Each panel gives the proportion of a
          team's goalkeeper distributions landing in each zone, highlighting
          structural preferences rather than volume or accuracy. The data
          reveals a split between short-build and more direct teams. Tottenham,
          Liverpool, Arsenal and Manchester City show higher concentrations in
          the first and second thirds, particularly in wide defensive zones:
          their goalkeepers distribute shorter, often to full-backs, preserving
          positional structure and enabling controlled build-up. In contrast,
          Leicester, West Brom, Sunderland, Watford and Crystal Palace make
          heavier use of advanced wide and central zones, indicating a
          preference for bypassing the first phase of play. For these teams,
          distribution is less about initiating possession sequences and more
          about contesting territory higher up the pitch.
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
            />
          </a>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="visual-title">Goalkeeper Passes Scatterplot</div>
        <div className="visual-description">
          These scatterplots show goalkeeper distribution profiles in the
          2015/16 Premier League season across three variables: share of long
          passes (x-axis), overall completion rate (y-axis, first figure) and
          long-pass completion rate (y-axis, second figure). The first figure
          shows a clear negative relationship: as the share of long passes
          rises, overall completion falls. Tottenham, Liverpool, Bournemouth,
          Everton and Swansea combine a low share of long distribution with
          high completion rates, while Leicester, West Brom, Sunderland, Crystal
          Palace and Watford rely heavily on long balls and record comparatively
          low completion rates. Leicester are the clearest outlier, with one of
          the league's highest long-pass shares and the lowest completion rate
          of the teams plotted. This inefficiency in raw completion did not
          hinder results: Leicester won the league. Under Claudio Ranieri, the
          approach was not built on retaining possession; long distribution
          frequently targeted Jamie Vardy or the channels behind the
          opposition, prioritising territory, second balls and transition speed
          over completion. In this context, a low completion rate is a feature
          of a risk-seeking, vertical strategy rather than a flaw.
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
            />
          </a>
          <a
            href="img/statsbomb-showcase/scatterplotShareOfLong_b.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="img/statsbomb-showcase/scatterplotShareOfLong_b.png"
              alt="Premier League 2015/16 Goalkeeper Distribution Scatterplot"
            />
          </a>
        </div>
      </div>

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
  );
}

export default StatsbombShowcase;
