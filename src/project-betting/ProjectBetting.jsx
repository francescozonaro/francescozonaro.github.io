import "./ProjectBetting.css";
import React from "react";
import { useNavigate } from "react-router-dom";

function ProjectBetting() {
  const navigate = useNavigate();

  function toggleTestingBets() {
    var content = document.getElementById("bets-container-completed-testing");
    var pagination = document.getElementById("pagination-container-testing");
    if (content.style.display === "none") {
      content.style.display = "block";
      pagination.style.display = "block";
    } else {
      content.style.display = "none";
      pagination.style.display = "none";
    }
  }

  function toggleCompletedBets() {
    var content = document.getElementById("bets-container-completed");
    var pagination = document.getElementById("pagination-container-completed");
    if (content.style.display === "none") {
      content.style.display = "block";
      pagination.style.display = "block";
    } else {
      content.style.display = "none";
      pagination.style.display = "none";
    }
  }

  function scrollToTop() {
    setTimeout(function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  return (
    <div className="ProjectBetting">
      <div className="header">
        <div class="title">
          <strong>Is there a profit to be made</strong> in the football betting
          industry?
        </div>
      </div>

      <div id="introduction-wrapper">
        <div className="intro-text">
          The goal of this project was to explore the feasibility of developing
          a reliable betting algorithm capable of sustaining long-term profit
          with limited publicly available data. Initially employing a
          statistical approach, the project has since evolved to incorporate
          machine learning techniques.
          <br></br>
          <br></br>
          <h1>Statistical approach</h1>
          Let's break down the workflow, considering a specific match. By
          leveraging xG and xGA data from previous matches involving both teams,
          an <code>xScore</code> value is computed, representing the expected
          number of goals for the upcoming match. Next, the probability of the
          match ending with goals ranging from 0 to 8 is calculated using the
          Poisson distribution to model the goal-scoring probability for each
          interval, with the xScore serving as the lambda factor. The higher the
          sum of the xScores, the greater the probability of a high-scoring
          match. For more details, refer to{" "}
          <a
            href="https://bookdown.org/theqdata/honors_thesis/goal-scoring-and-the-poisson-process.html"
            target="_blank"
          >
            this source on goal scoring and the Poisson process.
          </a>{" "}
          Specifically, the expected odd (<code>xOdd</code>) for the Over 2.5
          event is computed as the inverse of the sum of all probabilities
          involved. Subsequently, the odds proposed by the bookmaker are
          compared with the calculated xOdd: if{" "}
          <code>bookmakerOdd - xOdd &gt; 0</code>, the bet is identified as
          valuable, as according to our model, the bookmaker is offering more
          than it should. From this point, additional checks are performed: a
          certain value threshold must be reached, and the average frequency of
          the Over 2.5 event occurring throughout the season for the two
          involved teams is taken into account. The initial xScore is computed
          considering only current-season data. This is done to avoid having too
          much bias based on historical results, which are not reliable enough
          when modelling the scoring capability of a team during a specific
          season: players come and go, managers test new strategies and club
          performances fluctuate. A great example of that, coming from the
          2022-23 season, have been Fulham and Chelsea: the first scoring a
          fantastic 55 goals as a newly promoted side, while the second didn't
          even reach 40. Of course, envisioning a complete inversion of the
          football pyramid and discarding any previous data might be a tad too
          radical, which is why the historical information is kept through the
          use of an overall performance indicator, allowing the placement of
          each team in different tiers ("Top", "Mid" or "Bottom"). This
          information is then used to adjust the predicted xScore for the next
          match. The adjustment is based on the historical quality of the teams
          recently encountered, against which the xG and xGA metrics were
          produced. This is done to avoid punishing too much a team after a run
          of difficult matches and viceversa to avoid boosting too much the goal
          scoring capabilities of a team that recently performed well against
          the worst teams in the league. Moreover, as much as current season
          data remains key, is far more common for an historically good team to
          be consistent and gain momentum during the season; meanwhile a newly
          promoted or historically bad side may encounter more obstacles in
          mantaining a constant level of performances. This is taken into
          account when calculating the xScore. The coefficients used to
          calculate and adjust the xScores underwent calibration using
          historical data from past seasons. Following calibration, the testing
          phase was conducted on the 2022-2023 season data, which had not been
          previously seen by the algorithm. During this phase, the algorithm's
          predictions were compared against historical Bet365 odds, obtained
          from{" "}
          <a href="https://football-data.co.uk/" target="_blank">
            football-data.co.uk
          </a>
          .<br></br>
          <h3>Calibration</h3>
          During calibration, all matches in the top 5 leagues from the 18-19 to
          the 21-22 season were divided in different buckets, based on the
          computed Over 2.5 xOdd. Per each bucket, the true frequency of the
          Over 2.5 event happening was then calculated. Ideally, the true
          frequency for each bucket should be as close as possible to the
          predicted odd associated to the bucket. For example, if 100 matches
          were placed in the 2.0 odd bucket, ideally 50 matches should have
          ended with more than 2.5 goals. Coefficients were adjusted based on
          the results.
        </div>

        <br></br>

        <figure style={{ maxWidth: "600px", margin: "auto" }}>
          <img
            src="/img/calibration.svg"
            style={{ width: "100%", maxWidth: "100%" }}
            alt="Calibration"
          />
          <figcaption style={{ textAlign: "center" }}>
            Fig 1.1: Calibration Values
          </figcaption>
        </figure>

        <br></br>

        <div className="intro-text">
          Fig. 1.1 displays the final values calculated in the calibration
          phase. Odd-buckets are placed on the X axis. To each odd is associated
          the group of matches for which the algorithm predicted that xOdd. The
          grey line is the ideal (true) frequency for each odd, corresponding to
          100/Odd. The blue line represents the actual distribution obtained,
          with the highlighted area being the prediction error. Note that there
          is a difference between having an error generated by overstimating or
          understimating the odd. As can be see in the left part of the graph,
          the error is highlighted in red because this is where money is
          actually lost. Concentrating on the 1.4 odd, we can see that the
          frequency of the event happening is much lower than what we would
          expect. This means that the algorithm will suggest betting more often
          than it should, even when considering the required value threshold,
          resulting in losing money. The right side of the grap pictures a
          different situation. Even if it can still be considered an error, in
          this case we are not losing money but we are missing opportunities to
          make a profit. Let's consider the 2.4 odd. In this case, the ideal
          frequency is 100/2.4 = 41.66% meaning that we expect such event to
          happen roughly 42% of the times we bet on it. As we can see from the
          blue line, the true frequency is in reality 45%. This means that we
          tend to underestimate the likelihood of the event happening and,
          albeit not losing money, we may not bet even if the bookmaker gave us
          a marginally favourable odd for that specific match.
          <br></br>
          <h3>Testing</h3>
          After the calibration process, the algorithm was tested. The results
          of the bets the algorithm would have placed during the 22-23 season in
          the top 5 leagues are displayed below:
          <center style={{ marginTop: "15px", marginBottom: "15px" }}>
            Money spent: 1352.0$ on 835 matches. Money won: 1410.24$.{" "}
            <code>(4.308% ROI)</code>
          </center>{" "}
          Note that the algorithm considered 45% of the total number of matches
          in a season (835 out of 1826) as worth betting on. The reason why this
          happened is twofold: the Over 2.5 result is (more or less) as frequent
          as the Under 2.5 result, meaning ~50% of matches will actually end
          with 3 ore more goals; furthermore, the choosen value threshold (0.1)
          favoured chasing the profit rather than cutting the losses, meaning
          this version of the algorithm tended to bet (less money) even when the
          conditions were not entirely favourable.
          <br></br>
          <br></br>
          <h1>Machine Learning</h1>
          Having laid the groundwork with an intuitive approach, the project
          progressed to incorporate machine learning techniques to enhance the
          algorithm's capabilities. The{" "}
          <a href="pdf/projectBetting.pdf" target="_blank">
            produced full report is available
          </a>
          , with key findings highlighted here. A range of methodologies,
          primarily centered around XGBoost and Recurrent Neural Networks
          (RNNs), were explored. The implementation of RNNs yielded only
          marginal performance gains compared to the simpler XGBoost model. The
          additional complexity introduced by managing temporal series and the
          subsequent increase in computational time did not justify the effort,
          especially given the small volume of available data and our resource
          constraints. The remarkable flexibility of XGBoost, prompted us to
          further investigate this method. Using XGBoost also allowed the
          integration of{" "}
          <a href="https://github.com/shap/shap" target="_blank">
            SHAP
          </a>
          , which revealed crucially useful during both the development and
          testing phases. SHAP enabled a transparent understanding of the
          algorithm predictions, mitigating the known explainability problem
          associated with complex machine learning models. Finally, the addition
          of a thresholding algorithm determining the optimal model confidence
          level required to consider predictions reliable, allowed the final
          implementation to deliver overall positive performances when paired
          with different betting strategies.
        </div>
      </div>

      <div id="outro-wrapper">
        <div className="outro-links">
          <button
            class="buttonLink"
            onClick={() => navigate("/")}
            style={{ display: "inline-block", width: "50%" }}
          >
            [Portfolio]
          </button>
          <button
            class="buttonLink"
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

export default ProjectBetting;
