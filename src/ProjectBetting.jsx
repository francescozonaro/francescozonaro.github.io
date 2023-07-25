import "./ProjectBetting.css";

import axios from "axios";
import React, { useEffect } from "react";

function ProjectBetting() {
  useEffect(() => {
    axios
      .get(
        "https://e3exeuwqd3fdztghs3u6x4wtsi0qyqen.lambda-url.us-east-1.on.aws/api/getLiveBets"
      )
      .then(function (res) {
        const bets = res.data;
        var rows = "";

        bets.forEach((bet) => {
          var row = "<tr>";
          for (var key in bet) {
            if (key == "Date") {
              bet[key] = bet[key].substring(0, 10);
            }

            if (key == "Result") {
              if (bet[key] == "") {
                bet[key] = "⌛";
              }
            }

            row += "<td>" + bet[key] + "</td>";
          }
          row += "</tr>";
          rows += row;
        });

        if (rows != "") {
          var table =
            "<table> <tr><th>Date</th><th>League</th><th>Home</th><th>Away</th><th>Type</th><th>Quote</th><th>Bet</th><th>Potential Return</th><th>xQuote</th><th>Value</th><th>Quote %</th><th>Result</th></tr>" +
            rows +
            "</table>";

          const betsContainer = document.getElementById("bets-container-live");
          betsContainer.innerHTML = table;
        }
      });

    axios
      .get(
        "https://e3exeuwqd3fdztghs3u6x4wtsi0qyqen.lambda-url.us-east-1.on.aws/api/getCompletedBets"
      )
      .then(function (res) {
        const bets = res.data;
        var rows = "";

        bets.forEach((bet) => {
          var row = "<tr>";
          for (var key in bet) {
            if (key == "Date") {
              bet[key] = bet[key].substring(0, 10);
            }

            if (key == "Result") {
              if (bet[key] == true) {
                bet[key] = "✔️";
              } else {
                bet[key] = "❌";
              }
            }

            row += "<td>" + bet[key] + "</td>";
          }
          row += "</tr>";
          rows += row;
        });

        if (rows != "") {
          var table =
            "<table> <tr><th>Date</th><th>League</th><th>Home</th><th>Away</th><th>Type</th><th>Quote</th><th>Bet</th><th>Potential Return</th><th>xQuote</th><th>Value</th><th>Quote %</th><th>Result</th></tr>" +
            rows +
            "</table>";

          const betsContainer = document.getElementById(
            "bets-container-completed"
          );
          betsContainer.innerHTML = table;
        }
      });
  }, []);

  function toggleCompletedBets() {
    var content = document.getElementById("bets-container-completed");
    if (content.style.display === "none") {
      content.style.display = "block";
    } else {
      content.style.display = "none";
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    var content = document.getElementById("bets-container-completed");
    if (!(content.style.display === "none")) {
      toggleCompletedBets();
    }
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
            The objective of this work is to create a reliable betting model
            that would be able to generate a profit throughout the season. The
            algorithm is characterized by three key components: the use of xG to
            model scoring probabilities, the emphasis on season-specific data
            and the use of ClubELO data to keep track of which teams are
            historically better than others. Is important to note that even if
            the model was implemented to work with Over/Under 2.5 bets and Both
            Team To Score Yes/No bets, this version specifically focuses on the
            Over 2.5 bets, which were the ones giving the best ROI when tested.
            <br></br>
            <br></br>
            Let's see break down the steps to bet on a specific match. By
            leveraging xG data from previous matches, a new xG value is computed
            for both teams: the expected xG for the following match. After
            computing both values, the probability of the match ending with a
            certain amount of goals is calculated (the higher the sum of the
            xGs, the higher will be the probability of an high scoring match)
            and the expected quote (xQuote) is computed for the Over 2.5
            category. If <code>Quote - xQuote &gt; 0</code>, then the bet is
            expected to provide some value, because the bookie is offering more
            than it should. The process when choosing which matches to bet on is
            slightly more complicated: a certain value threshold has to be
            reached and the average frequency of the Over 2.5 event happening
            throughout the season for the two involved teams is taken into
            account.
            <br></br>
            <br></br>
            The initial xG is computed considering only this season data, which
            means the algorithm cannot be used right away from the start of the
            season. This is done to avoid having too much bias based on
            historical results, which are not reliable enough when modelling the
            xG of a team during a specific season. A great example of that,
            coming from the 2022-23 season, are Fulham and Chelsea: the first
            scoring a fantastic 55 goals as a newly promoted side while the
            second didn't even reach 40. Still, ClubELO data is a valuable
            source of information to at least try and place each team in the
            "Top", "Mid" or "Bottom" category. Note that this could be done
            simply using the current table, but particularly at the start of the
            season that may be too volatile. This information is then used to
            slightly adjust the predicted xG for the next match, basing the
            adjustment on which teams were recently encountered. This is done to
            avoid punishing too much a team after a run of difficult matches
            (against "Top" opponents) and viceversa avoid boosting too much a
            team that recently played all the worst teams ("Bottom" opponents)
            in the league. There is one more possible use for the ClubELO data:
            as much as current season data remains key, is far more common for
            an historically good team to be consistent and gain momentum during
            the season; meanwhile a newly promoted or historically bad side may
            encounter more obstacles in mantaining a constant level of
            performances. This could be modelized giving slightly more
            importance to the most recent positive results when considering a
            team with an high ELO.
            <br></br>
            <br></br>
            The algorithm was tested in two ways: a calibration phase in which
            it was analyzed the accuracy of the predicted outcome without taking
            into consideration any specific bookie and a proper testing phase
            using historical Bet365 odds (taken from football-data.co.uk).
            Regarding the algorithm calibration, the idea has been to calculate
            the odd of the Over 2.5 result happening for all matches in the top
            5 leagues from the 18-19 to the 22-23 season (note: with the same
            approach described before, so every season is considered separately
            with the only source of historic data being ClubELO), then divide
            all the matches in different buckets, based on the expected quote,
            and calculate the frequency of the Over 2.5 event for each bucket.
            Ideally, the frequency for each bucket should be as close as
            possible to the predicted quote associated to the bucket. If 100
            matches were placed in the 2.0 quote, ideally 50 matches should have
            ended with an Over 2.5. Is worth noting that the point of the
            algorithm isn't always placing a winning bet, but being able to
            predict the outcome of the match more accurately than the bookie.
            Suppose you know that you are perfectly able to predict the correct
            probability of the Over 2.5 event happening. If you bet{" "}
            <code>1$</code> on 1000 matches in which the Over 2.5 event has a{" "}
            <code>2.0</code> odd, then you will win 500 of those 1000 bets, and
            get back <code>500*2 = 1000$</code>. Of course this doesn't make
            sense, but here is the key idea: you only bet on a match if the
            bookie gives you a favourable odd. Suppose you placed those 1000
            bets on Bet365 and the value threshold for each bet to be placed was{" "}
            <code>0.1</code>, it means that you bet on a match only if the
            bookie gives you a quote which is at least <code>0.1</code> higher
            than what the algorithm predicted. Back to the previous example,
            lets say you placed 1000 bets, each worth <code>1$</code>, on 1000
            different matches in which the algorithm predicted a{" "}
            <code>2.0</code> odd, while the bookie always gave you a{" "}
            <code>2.1</code> odd (simplifying, could be more) for those bets.
            You will still win 50% of your bets, but in this scenario the money
            earned will be <code>500*2.1$</code>, meaning that after investing{" "}
            <code>1000$</code>, you get back <code>1100$</code>, with a 10%
            profit (which of course is equal to <code>threshold*100</code>). Of
            course, the higher the threshold value is, the lower will be the
            number of placed bets.
          </div>

          <br></br>

          <img
            src="/img/calibration.svg"
            style={{ width: "100%", maxWidth: "600px", margin: "auto" }}
          />

          <br></br>

          <div className="intro-text">
            This are the values calculated in the calibration phase. On the X
            axis are representd the odds. To each odd is associated a group of
            matches, specifically all the matches for which the algorithm
            identified the aforementioned predicted odd as the most probable one
            for the Over 2.5 event. The grey line is the ideal distribution,
            obtained when the frequency of an event happening is exactly equal
            to <code>100/xQuote</code>. The blue line represents the actual
            distribution.. For example regarding the 1.4 bucket, the ideal
            frequency value is <code>100/1.4 = 71.5%</code> whilst the actual
            frequency is calculated as the total number of matches ending with
            an Over 2.5 divided by the total number of matches: in this case{" "}
            <code>61%</code>. Generally speaking, the distance between the grey
            and the blue line can be considered the calibration error and should
            be minimised. That said, there is a difference between having an
            error generated by overstimating or understimating the odd. As we
            can see in the left part of the graph, the error is highlighted in
            red because this is where money is actually lost. Concentrating
            again on the 1.4 odd, we can see that the frequency of the event
            happening is much lower than what we would expect. This means that
            the algorithm will suggest betting more often than it should,
            resulting in losing money, even considering the value threshold.
            Let's say we bet 1$ on 100 matches in which the bookie offers an odd
            of 1.5 while the algorithm predicts 1.4. Ideally, we would win 71.5%
            of the times, meaning we will get back roughly{" "}
            <code>71 * 1.5 = 106.5$</code>, with a profit of <code>6.5$</code>.
            Considering the real frequency though, we will win only{" "}
            <code>61 * 1.5 = 91.5$</code>, corresponding to a loss of{" "}
            <code>8.5$</code>. The right side of the graph gives us a completely
            different situation. Even if this can still be considered an error,
            in this case we are not losing money but we are missing
            opportunities to make a profit. Let's consider the 2.4 odd. In this
            case, the ideal frequency is of course <code>100/2.4 = 41.66%</code>{" "}
            meaning that we expect such event to happen roughly <code>42%</code>{" "}
            of the times we bet on it. As we can see from the blue line, the
            true frequency is in reality <code>45%</code>. Apparently this may
            be considered positive, because we will win more than we expect to,
            but its important to remember that to bet on a match we need a value
            threshold to be reached. This means that to bet on a match for which
            the "correct odd" should be 2.2 (calculated as 100/true frequency,{" "}
            <code>100/45 = 2.2</code>), our predicted odd is 2.4 and the
            threshold is 0.1, we would need the bookie to give us a{" "}
            <code>2.4 + 0.1 = 2.5</code> quote, which isn't necessarily
            something a bookie will do. This means that, albeit not losing
            money, we won't bet (and won't get a profit) even if the bookie gave
            us a favourable 2.35 or even 2.45 quote for that specific match.
          </div>

          <br></br>

          <div className="intro-text">
            Below are displayed all the bets the algorithm would have placed
            during the 22-23 season in the top 5 leagues, with the following
            result:
            <center style={{ marginTop: "15px" }}>
              <code>
                Money spent: 1352.0$ on 835 matches. Money won: 1999.27$,
                47.875% ROI.
              </code>
            </center>
            <br></br>
            Value bets were calculated using Bet365 as the betting bookie. Even
            if historical data was used, only data that would have been
            available prior to the considered match was, of course, used. It's
            important to notice the algorithm considered 45% of the total number
            of matches in a season (835 out of 1826) as worth betting on. The
            reason why this happened is twofold: the Over 2.5 result is (more or
            less) as frequent as the Under 2.5 result, meaning 50% of matches
            will actually end with 3 ore more goals; furthermore, the
            configuration used favours chasing the profit rather than cutting
            the losses, therefore the algorithm tends to bet (less money) even
            when the condition are not entirely favourable.
          </div>
        </div>

        <div id="table-wrapper">
          <div id="bets-container-live"></div>
        </div>

        <button
          type="button"
          id="collapse-past-bets"
          onClick={() => toggleCompletedBets()}
        >
          Show 2022-23 bets
        </button>

        <div id="table-wrapper">
          <div id="bets-container-completed" style={{ display: "none" }}></div>
        </div>

        <div id="outro-wrapper">
          <div className="outro-text">
            First results are encouraging and the algorithm will be further
            tested during the 23-24 season.
          </div>

          <div className="outro-links">
            <a
              href="https://francescozonaro.github.io/"
              target="_blank"
              style={{ display: "inline-block", width: "50%" }}
            >
              [Portfolio]
            </a>
            <a
              href="#"
              style={{
                display: "inline-block",
                width: "50%",
              }}
              onClick={() => scrollToTop()}
            >
              [Back to the top]
            </a>
          </div>
        </div>
    </div>
  );
}

export default ProjectBetting;
