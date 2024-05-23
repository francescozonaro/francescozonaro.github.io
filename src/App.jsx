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
          <h5>Projects</h5>
        </div>

        <div class="project">
          <div class="projectName">
            Is there a profit to be made in the football betting industry?
            <span className="links">
              <button class="buttonLink" onClick={() => navigate("/betting")}>
                [Report]
              </button>
            </span>
          </div>
          <div class="project-viz">
            <img
              src="img/fzbets.jpg"
              style={{
                height: "100px",
                width: "100%",
                objectFit: "cover",
                filter: "saturate(0.8)",
              }}
            ></img>
          </div>
        </div>

        <div class="project">
          <div class="projectName">
            Plotting Statsbomb data: Italy vs England match report
            <span className="links">
              <button
                class="buttonLink"
                style={{ marginRight: "10px" }}
                onClick={() => navigate("/statsbomb-showcase")}
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
              src="img/statsbomb.png"
              style={{
                height: "100px",
                width: "100%",
                objectFit: "cover",
                filter: "saturate(0.9)",
              }}
            ></img>
          </div>
          <div class="separator" style={{ marginTop: "30px" }}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
