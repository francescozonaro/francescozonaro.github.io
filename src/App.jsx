import "./App.css";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <div class="container">
        <div class="header">
          <h1>
            <strong>Francesco</strong> Zonaro
          </h1>

          <a style={{ marginRight: "0.25em" }} href="" target="_blank">
            <img src="img/linkedin.png" />
          </a>
          <a
            style={{ marginLeft: "0.25em" }}
            href="https://github.com/francescozonaro"
            target="_blank"
          >
            <img src="img/github.png" />
          </a>
          <br></br>
          <a
            class="button"
            href=""
            target="_blank"
            style={{ marginTop: "3em" }}
          >
            Résumé
          </a>
        </div>
        <div class="title">
          <h3>Projects</h3>
        </div>

        <div class="project">
          <div class="projectName">
            Is there a profit to be made in the current betting market?
            <span className="links">
              <button class="buttonLink" onClick={() => navigate("/betting")}>
                [Website]
              </button>
            </span>
          </div>
          <div class="project-viz">
            <img
              src="img/fzbets.png"
              style={{ height: "100px", width: "100%", objectFit: "cover" }}
            ></img>
          </div>
        </div>

        <div class="project">
          <div class="projectName">
            StatsbombPlot Showcase: Italy vs England (EURO2020 Final)
            <span className="links">
              <button
                class="buttonLink"
                style={{ marginRight: "10px" }}
                onClick={() => navigate("/italy-england-report")}
              >
                [Report]
              </button>

              <button
                class="buttonLink"
                onClick={() =>
                  window.open(
                    "https://github.com/francescozonaro/statsbombplot",
                    "_blank"
                  )
                }
              >
                [Github Repo]
              </button>
            </span>
          </div>
          <div class="project-viz">
            <img
              src="img/euro2020italy.jpg"
              style={{ height: "100px", width: "100%", objectFit: "cover" }}
            ></img>
          </div>
          <div class="separator"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
