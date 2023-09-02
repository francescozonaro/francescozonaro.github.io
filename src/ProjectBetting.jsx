import "./ProjectBetting.css";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProjectBetting() {
  const navigate = useNavigate();

  useEffect(() => {
    function fetchDataAndGenerateTable(
      apiUrl,
      betsContainerId,
      paginationContainerId,
      isCompletedBets
    ) {
      axios.get(apiUrl).then(function (res) {
        const originalBets = res.data;
        const itemsPerPage = 20;
        const totalPages = Math.ceil(originalBets.length / itemsPerPage);

        function modifyBetData(bet) {
          const modifiedBet = { ...bet };
          if (modifiedBet["Date"]) {
            modifiedBet["Date"] = modifiedBet["Date"].substring(0, 10);
          }

          if (modifiedBet["Bet"] && !String(modifiedBet["Bet"]).includes("€")) {
            modifiedBet["Bet"] = modifiedBet["Bet"] + "€";
          }

          if (modifiedBet["Result"] !== undefined) {
            if (isCompletedBets) {
              modifiedBet["Result"] = modifiedBet["Result"] ? "✔️" : "❌";
            } else {
              if (modifiedBet["Result"] === "") {
                modifiedBet["Result"] = "⌛";
              }
            }
          }

          return modifiedBet;
        }

        function generateTable(page) {
          var startIndex = (page - 1) * itemsPerPage;
          var endIndex = startIndex + itemsPerPage;
          var rows = "";

          for (
            var i = startIndex;
            i < endIndex && i < originalBets.length;
            i++
          ) {
            var originalBet = originalBets[i];
            var modifiedBet = modifyBetData(originalBet);
            var row = "<tr>";

            for (var key in modifiedBet) {
              row += "<td>" + modifiedBet[key] + "</td>";
            }

            row += "</tr>";
            rows += row;
          }

          if (rows != "") {
            var table =
              "<table> <tr><th>Date</th><th>League</th><th>Home</th><th>Away</th><th>Type</th><th>Quote</th><th>Bet</th><th>Return</th><th>xQuote</th><th>Value</th><th>Quote %</th><th>Result</th></tr>" +
              rows +
              "</table>";

            const betsContainer = document.getElementById(betsContainerId);
            betsContainer.innerHTML = table;
          }
        }

        generateTable(1);

        const paginationContainer = document.getElementById(
          paginationContainerId
        );

        while (paginationContainer.firstChild) {
          paginationContainer.removeChild(paginationContainer.firstChild);
        }

        for (var page = 1; page <= totalPages; page++) {
          var button = document.createElement("button");
          button.textContent = page;
          button.classList.add("pagination-button");

          button.addEventListener("click", function () {
            generateTable(parseInt(this.textContent));
          });

          paginationContainer.appendChild(button);
        }
      });
    }

    fetchDataAndGenerateTable(
      "https://e3exeuwqd3fdztghs3u6x4wtsi0qyqen.lambda-url.us-east-1.on.aws/api/getLive2324Bets",
      "bets-container-live",
      "pagination-container",
      false
    );

    fetchDataAndGenerateTable(
      "https://e3exeuwqd3fdztghs3u6x4wtsi0qyqen.lambda-url.us-east-1.on.aws/api/getCompleted2324Bets",
      "bets-container-completed",
      "pagination-container-completed",
      true
    );

    fetchDataAndGenerateTable(
      "https://e3exeuwqd3fdztghs3u6x4wtsi0qyqen.lambda-url.us-east-1.on.aws/api/getTestingBets",
      "bets-container-completed-testing",
      "pagination-container-testing",
      true
    );
  }, []);

  const [loadingText, setLoadingText] = useState(
    "Waiting for the initial GWs to be played"
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingText((prevText) =>
        prevText.endsWith("...") ? prevText.slice(0, -3) : `${prevText}.`
      );
    }, 700);

    return () => {
      clearInterval(timer);
    };
  }, []);

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
          The objective of this work is to create a reliable betting model that
          would be able to generate a profit throughout the season. The
          algorithm is characterized by three key components: the use of xG to
          model scoring probabilities, the emphasis on season-specific data and
          the use of ClubELO data to keep track of which teams are historically
          better than others. Specifically, this model focuses on the Over 2.5
          market.
          <br></br>
          <br></br>
          <h1>Chapter One: The idea</h1>
          Let's break down the initial workflow, considering a specific match.
          By leveraging xG (and xGA) data from previous matches, a new xG value
          is computed for both teams: the expected xG (yeah, I know..) for the
          following match. After computing both values, the probability of the
          match ending with a certain amount of goals is calculated (the higher
          the sum of the xGs, the higher will be the probability of an high
          scoring match) and the expected quote (xQuote) is computed for the
          Over 2.5 category. If <code>Bookie Quote - xQuote &gt; 0</code>, the
          bet is expected to provide some value, because according to the model
          the bookie is offering more than it should. In reality, the process is
          slightly more complicated: a certain value threshold has to be reached
          and the average frequency of the Over 2.5 event happening throughout
          the season for the two involved teams is taken into account.
          <br></br>
          <br></br>
          The initial xG is computed considering only this season data, which
          means the algorithm cannot be used right away from the start of the
          season. This is done to avoid having too much bias based on historical
          results, which are not reliable enough when modelling the xG of a team
          during a specific season: players come and go and managers begin to
          contemplate extravagant changes during the off-season, only to
          discover in November that yeah you can't actually play 5 inverted
          wingbacks in the same formation. A great example of that, coming from
          the 2022-23 season, are Fulham and Chelsea: the first scoring a
          fantastic 55 goals as a newly promoted side while the second didn't
          even reach 40. Of course, envisioning a complete inversion of the
          soccer pyramid and discarding any previous data might be a tad too
          radical, which is why ClubELO data is taken into consideration.
          ClubELO is a valuable source of information and allows to place each
          team in the "Top", "Mid" or "Bottom" category. Note that this could be
          done simply using the current table position during any given
          matchday, but particularly in the first part of the season that may be
          too volatile. This information is then used to adjust the predicted xG
          for the next match, basing the adjustment on the historical quality of
          the teams that were recently encountered. This is done to avoid
          punishing too much a team after a run of difficult matches (against
          "Top" opponents) and viceversa to avoid boosting too much a team that
          recently played all the worst teams ("Bottom" opponents) in the
          league. There is one more possible use for the ClubELO data: as much
          as current season data remains key, is far more common for an
          historically good team to be consistent and gain momentum during the
          season; meanwhile a newly promoted or historically bad side may
          encounter more obstacles in mantaining a constant level of
          performances. This could be modelized giving slightly more importance
          to the most recent positive results when considering a team with an
          high ELO.
          <br></br>
          <br></br>
          <h1>Chapter Two: Off-season testing</h1>
          The algorithm was tested in two ways: a calibration phase in which it
          was analyzed the accuracy of the predicted outcome without taking into
          consideration any specific bookie (answering to the question: can I
          reliably predict when a match will have more than 2.5 goals,
          regardless the fact that there is a valuable bet to place?) and a more
          hands-on testing phase using historical Bet365 odds from{" "}
          <a href="https://football-data.co.uk/" target="_blank">
            football-data.co.uk
          </a>
          . Regarding calibration, the idea has been to calculate the odd of the
          Over 2.5 result happening for all matches in the top 5 leagues from
          the 18-19 to the 22-23 season (note: with the same approach described
          before, so every season is considered separately with the only source
          of historic data being ClubELO), then divide all the matches in
          different buckets, based on the expected quote, and calculate the true
          frequency of the Over 2.5 event for each bucket. Ideally, the
          frequency for each bucket should be as close as possible to the
          predicted quote associated to the bucket. If 100 matches were placed
          in the 2.0 quote, ideally 50 matches should have ended with 3 or more
          goals. Is worth specifying that the point of the algorithm won't be
          always placing a winning bet, but being able to predict the outcome of
          the match more accurately than the bookie. Suppose you are perfectly
          able to predict the probability of the Over 2.5 event happening. If
          you bet 1$ on 1000 matches in which you know the market has a 2.0 odd,
          then you will win 500 of those 1000 bets, and get back 500*2 = 1000$.
          Of course this doesn't make sense, but here is the key idea: you only
          bet on a match if the bookie gives you a favourable odd (..shocking am
          I right?). Suppose to bet on a match only if the bookie gives you a
          quote which is at least 0.1 higher than your (supposedly perfect for
          the sake of the math) predicted quote: you will still win 50% of your
          bets, but in this scenario the money earned will be 500*2.1$, meaning
          that you invested 1000$ and got 1100$ back, with a 10% profit (which
          of course is equal to <code>threshold*100</code>). Of course, the
          higher the threshold value is, the lower will be the number of placed
          bets.
        </div>

        <br></br>

        <img
          src="/img/calibration.svg"
          style={{ width: "100%", maxWidth: "600px", margin: "auto" }}
        />

        <br></br>

        <div className="intro-text">
          This are the values calculated in the calibration phase. On the X axis
          are representd the odds. To each odd is associated a group of matches,
          specifically all the matches for which the algorithm identified the
          aforementioned predicted odd as the most probable one for the Over 2.5
          event. The grey line is the ideal distribution, obtained when the
          frequency of an event happening is exactly equal to{" "}
          <code>100/xQuote</code>. The blue line represents the actual
          distribution. For example regarding the 1.4 bucket, the ideal
          frequency value is 100/1.4 = 71.5% whilst the actual frequency is
          calculated as the total number of matches ending with an Over 2.5
          divided by the total number of matches: in this case 61%. Generally
          speaking, the distance between the grey and the blue line can be
          considered the calibration error and should be minimised. That said,
          there is a difference between having an error generated by
          overstimating or understimating the odd. As we can see in the left
          part of the graph, the error is highlighted in red because this is
          where money is actually lost. Concentrating again on the 1.4 odd, we
          can see that the frequency of the event happening is much lower than
          what we would expect. This means that the algorithm will suggest
          betting more often than it should, resulting in losing money, even
          considering the value threshold. Let's say we bet 1$ on 100 matches in
          which the bookie offers an odd of 1.5 while the algorithm predicts
          1.4. Ideally, we would win 71.5% of the times, meaning we will get
          back roughly 71 * 1.5 = 106.5$, with a profit of 6.5$. Considering the
          real frequency though, we will win only 61 * 1.5 = 91.5$,
          corresponding to a loss of 8.5$. The right side of the graph gives us
          a completely different situation. Even if this can still be considered
          an error, in this case we are not losing money but we are missing
          opportunities to make a profit. Let's consider the 2.4 odd. In this
          case, the ideal frequency is of course 100/2.4 = 41.66% meaning that
          we expect such event to happen roughly 42% of the times we bet on it.
          As we can see from the blue line, the true frequency is in reality
          45%. Apparently this may be considered positive, because we will win
          more than we expect to, but its important to remember that to bet on a
          match we need a value threshold to be reached. This means that to bet
          on a match for which the "correct odd" should be 2.2 (calculated as
          100/true frequency, 100/45 = 2.2), our predicted odd is 2.4 and the
          threshold is 0.1, we would need the bookie to give us a 2.4 + 0.1 =
          2.5 quote, which isn't necessarily something a bookie will do. This
          means that, albeit not losing money, we won't bet (and won't get a
          profit) even if the bookie gave us a favourable 2.35 or even 2.45
          quote for that specific match.
        </div>

        <br></br>
        <br></br>
        <div className="intro-text">
          <h1>Chapter Three: Simulated results</h1>
          Below are displayed all the bets the algorithm would have placed
          during the 22-23 season in the top 5 leagues, with the following
          result:
          <center style={{ marginTop: "15px", marginBottom: "15px" }}>
            Money spent: 1352.0$ on 835 matches. Money won: 1410.24$.{" "}
            <code>(4.308% ROI)</code>
          </center>
          Value bets were calculated using Bet365 as the betting bookie. Even if
          historical data was used, only data that would have been available
          prior to the considered match was, of course, used. It's important to
          notice the algorithm considered 45% of the total number of matches in
          a season (835 out of 1826) as worth betting on. The reason why this
          happened is twofold: the Over 2.5 result is (more or less) as frequent
          as the Under 2.5 result, meaning ~50% of matches will actually end
          with 3 ore more goals; furthermore, the specific configuration used
          favoured chasing the profit rather than cutting the losses, therefore
          the algorithm tends to bet (less money) even when the conditions are
          not entirely favourable.
        </div>

        <br></br>

        <button
          type="button"
          id="collapse-past-bets"
          onClick={() => toggleTestingBets()}
        >
          Show 2022-23 bets
        </button>
        <div
          id="pagination-container-testing"
          style={{ display: "none", marginTop: "20px" }}
        ></div>
        <div id="table-wrapper">
          <div
            id="bets-container-completed-testing"
            style={{ display: "none" }}
          ></div>
        </div>
        <br></br>
        <div className="intro-text">
          First results are encouraging and the algorithm will be further tested
          during the 23-24 season.
          <br></br>
          <br></br>
          <h1>Chapter Four: 2023-24</h1>
          <span>{loadingText}</span>
          <h3 style={{ textAlign: "center" }}>Live Bets</h3>
        </div>

        <div id="pagination-container" style={{ marginTop: "10px" }}></div>
        <div id="table-wrapper">
          <div id="bets-container-live"></div>
        </div>
        <button
          type="button"
          id="collapse-past-bets"
          onClick={() => toggleCompletedBets()}
          style={{ marginTop: "20px" }}
        >
          Show completed 2023-24 bets
        </button>
        <div
          id="pagination-container-completed"
          style={{ display: "none", marginTop: "30px" }}
        ></div>
        <div id="table-wrapper">
          <div id="bets-container-completed" style={{ display: "none" }}></div>
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
