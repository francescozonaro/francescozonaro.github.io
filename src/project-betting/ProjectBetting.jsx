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
    var content_testing = document.getElementById(
      "bets-container-completed-testing"
    );
    var content_completed = document.getElementById("bets-container-completed");
    if (!(content_testing.style.display === "none")) {
      toggleTestingBets();
    }
    if (!(content_completed.style.display === "none")) {
      toggleCompletedBets();
    }
    setTimeout(function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  return (
    <div className="ProjectBetting">
      <div className="header">
        <div class="title">
          <strong>Is there a profit to be made</strong> in the current betting
          market?
        </div>
      </div>

      <div id="introduction-wrapper">
        <div className="intro-text">
          The objective of this project is to create a reliable betting model
          that would be able to generate a long term profit. The algorithm is
          characterized by two key-components: the emphasis on current-season
          data to model scoring probabilities and the aggregation of previous
          season performances in a single indicator to keep track of which teams
          are historically better than others. Specifically, this project will
          focus on finding value in the Over 2.5 market.
          <br></br>
          <br></br>
          <h1>Chapter One: The idea</h1>
          Let's break down the initial workflow, considering a specific match.
          By leveraging xG (and xGA) data from previous matches, a new{" "}
          <code>xScore</code> value is computed for both teams: the expected
          number of goals for the following match. After computing both values,
          the probability of the match ending with a number of goals ranging
          from 0 to 8 is calculated, leveraging the poisson distribution with
          the xScore being the lambda factor. The higher the sum of the xScores,
          the higher will be the probability of an high scoring match. After
          that, the expected odd (<code>xOdd</code>) for the Over 2.5 event is
          computed. If <code>bookmakerOdd - xOdd &gt; 0</code>, the odd proposed
          by the bookmaker is expected to provide some value, because according
          to the model the bookmaker is offering more than it should. In
          reality, the process is slightly more complicated: a certain value
          threshold has to be reached and the average frequency of the Over 2.5
          event happening throughout the season for the two involved teams is
          taken into account. Moreover, the initial xScore is computed
          considering only current-season data. This is done to avoid having too
          much bias based on historical results, which are not reliable enough
          when modelling the scoring capability of a team during a specific
          season: players come and go, managers test new strategies and club
          performances fluctuate. A great example of that, coming from the
          2022-23 season, have been Fulham and Chelsea: the first scoring a
          fantastic 55 goals as a newly promoted side, while the second didn't
          even reach 40. Of course, envisioning a complete inversion of the
          soccer pyramid and discarding any previous data might be a tad too
          radical, which is why the historical information is kept through the
          use of an overall performance indicator, allowing the placement of
          each team in a different category ("Top", "Mid" or "Bottom"). Note
          that this could still be done using current-season data, simply using
          the current table position during any given matchday, but particularly
          in the first part of the season that may be too volatile. This
          information is then used to adjust the predicted xScore for the next
          match, basing the adjustment on the historical quality of the teams
          that were recently encountered. This is done to avoid punishing too
          much a team after a run of difficult matches (against "Top" opponents)
          and viceversa to avoid boosting too much a team that recently
          performed against the worst teams ("Bottom" opponents) in the league.
          Moreover, as much as current season data remains key, is far more
          common for an historically good team to be consistent and gain
          momentum during the season; meanwhile a newly promoted or historically
          bad side may encounter more obstacles in mantaining a constant level
          of performances. This can be taken into account when calculating the
          xScore.
          <br></br>
          <br></br>
          This embryonic algorithm underwent calibration using historical data
          from past seasons. Its objective was to ascertain the reliability of
          predicting whether a match would exceed 2.5 goals, irrespective of any
          potentially lucrative betting opportunities. Following calibration, a
          rigorous testing phase was conducted on the 2022-2023 season data,
          which had not been previously seen by the algorithm. During this
          phase, the algorithm's predictions were compared against historical
          odds from Bet365, obtained from{" "}
          <a href="https://football-data.co.uk/" target="_blank">
            football-data.co.uk
          </a>{" "}
          , to find potential betting opportunities.<br></br>
          <br></br>
          <h1>Chapter Two: Calibration</h1>
          During calibration, the idea has been to calculate the odd of the Over
          2.5 result happening for all matches in the top 5 leagues from the
          18-19 to the 21-22 season (note: as explained, every season is
          considered separately with the only source of historic data being the
          overall performance indicator), then divide all the matches in
          different buckets, based on the computed xOdd , and calculate the true
          frequency of the Over 2.5 event for each bucket. Ideally, the
          frequency for each bucket should be as close as possible to the
          predicted odd associated to the bucket. For example, if 100 matches
          were placed in the 2.0 odd bucket, ideally 50 matches should have
          ended with more than 2.5 goals. The way in which the xScore is
          calculated was repeatedly adjusted based on the results.
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
          In Fig. 1.1 are displayed the final values calculated in the
          calibration phase. On the X axis are represented the odds. To each odd
          is associated the group of matches for which the algorithm predicted
          that xOdd. The grey line is the ideal frequency for each odd,
          corresponding to 100/Odd. The blue line represents the actual
          distribution obtained, with the highlighted area being the prediction
          error. Note that there is a difference between having an error
          generated by overstimating or understimating the odd. As we can see in
          the left part of the graph, the error is highlighted in red because
          this is where money is actually lost. Concentrating on the 1.4 odd, we
          can see that the frequency of the event happening is much lower than
          what we would expect. This means that the algorithm will suggest
          betting more often than it should, even when considering the value
          threshold, resulting in losing money. The right side of the graph
          gives us a different situation. Even if this can still be considered
          an error, in this case we are not losing money but we are missing
          opportunities to make a profit. Let's consider the 2.4 odd. In this
          case, the ideal frequency is 100/2.4 = 41.66% meaning that we expect
          such event to happen roughly 42% of the times we bet on it. As we can
          see from the blue line, the true frequency is in reality 45%. This
          means that we tend to understimate the likelihood of the event
          happening. Apparently this may be considered positive, because we will
          win more than we expect to, but its important to remember that to bet
          on a match we need a value threshold to be reached. Supposing a 0.1
          threshold, this means that to bet on a match for which our predicted
          odd is 2.4 we would need the bookmaker to propose a 2.4 + 0.1 = 2.5
          odd. This means that, albeit not losing money, we won't bet (and won't
          get a profit) even if the bookmaker gave us a favourable 2.35 or even
          2.45 odd for that specific match.
        </div>
        <br></br>
        <br></br>
        <div className="intro-text">
          <h1>Chapter Three: Testing</h1>
          After the calibration process, the algorithm underwent testing,
          following a flat betting strategy on all instances where the algorithm
          identified a value exceeding the predetermined threshold. Below are
          displayed the results on the bets the algorithm would have placed
          during the 22-23 season in the top 5 leagues:
          <center style={{ marginTop: "15px", marginBottom: "15px" }}>
            Money spent: 1352.0$ on 835 matches. Money won: 1410.24$.{" "}
            <code>(4.308% ROI)</code>
          </center>
          Valuable bets were calculated using Bet365 as the bookmaker. Note that
          the algorithm considered 45% of the total number of matches in a
          season (835 out of 1826) as worth betting on. The reason why this
          happened is twofold: the Over 2.5 result is (more or less) as frequent
          as the Under 2.5 result, meaning ~50% of matches will actually end
          with 3 ore more goals; furthermore, the choosen value threshold
          favoured chasing the profit rather than cutting the losses, therefore
          the algorithm tends to bet (less money) even when the conditions are
          not entirely favourable. First results are encouraging and the
          algorithm will be further enhanced during the 23-24 season.
          <br></br>
          <br></br>
          <h1>Chapter Four: Machine Learning</h1>
          Having laid the groundwork with an intuitive approach, the project
          progressed to incorporate machine learning techniques to augment the
          algorithm's profitability. Over a period of 6 months, a range of
          methodologies, primarily centered around Recurrent Neural Networks
          (RNNs) and XGBoost, were explored. However, for brevity's sake, only
          the key findings will be outlined presently, with the option for a
          more comprehensive report should the reader be interested. The
          implementation of RNNs yielded only marginal performance gains
          compared to the simpler XGBoost model. The additional complexity
          introduced by managing temporal series and the subsequent increase in
          computational time did not justify the effort, especially given the
          small volume of available data and our resource constraints. The
          remarkable flexibility of XGBoost, coupled with its ability to closely
          approximate the performance of RNNs, prompted further investigation
          into this avenue. Using XGBoost also allowed the integration with{" "}
          <a href="https://github.com/shap/shap" target="_blank">
            SHAP
          </a>
          , a critical aspect during both development and testing phases. SHAP
          enabled a transparent understanding of algorithm predictions,
          mitigating the opacity often associated with machine learning models.
          This integration addressed the challenge of explainability, offering
          users insights through SHAP plots. Achieving consistent performance on
          all instances proved challenging. To address this, focus shifted to
          matches where model confidence was higher. A threshold algorithm,
          implemented during training, determined an optimal confidence level to
          be reached. This enhancement allowed the final algorithm to deliver
          overall positive performances when paired with different betting
          strategies.
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
