import "./App.css";

import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <div className="grid gap-x-12 mt-12 md:grid-cols-1 gap-y-4 lg:grid-cols-2 mb-12">
        <div className="flex flex-col justify-center align-middle">
          <div className="text-3xl">
            <strong>Francesco</strong> Zonaro
          </div>
        </div>
        <div className="flex justify-center align-middle space-x-2">
          <a href="https://github.com/francescozonaro" target="_blank">
            <img src="img/github.png" className="w-10" />
          </a>
          <a
            href="https://www.linkedin.com/in/francesco-zonaro-211234248/"
            target="_blank"
          >
            <img src="img/linkedin.png" className="w-10" />
          </a>
        </div>

        <div className="projects-container">
          <h1 className="font-bold mt-4 text-center text-2xl">Projects</h1>

          <div class="project">
            <div class="projectTitle">StatsbombPlot</div>
            <div className="projectDescription">
              Developing visualization techniques for Statsbomb event data
              analysis, focusing on enhancing interpretability and actionable
              insights.
            </div>
            <div className="project-links">
              <a href="/#/statsbomb-showcase" target="_blank">
                <img src="img/url.png" />
              </a>
              <a
                href="https://github.com/francescozonaro/statsbombplot"
                target="_blank"
              >
                <img src="img/code.png" />
              </a>
            </div>
          </div>
        </div>
        <div className="projects-container">
          <h1 className="font-bold mt-4 text-center text-2xl">Reports</h1>

          <div class="project">
            <div class="projectTitle">
              Agile development of web applications in resource-constrained
              scenarios: the case of Medicus Mundi
            </div>
            <div class="projectDescription">
              Created a user-friendly web platform for efficient data entry and
              management, improving data accuracy, disease tracking and
              healthcare delivery in resource-limited settings.
            </div>
            <div className="project-links">
              <a href="pdf/report-medicusmundi.pdf" target="_blank">
                <img src="img/report.png" />
              </a>
            </div>
          </div>

          <div class="project">
            <div class="projectTitle">
              Data-driven Sports Forecasting: analyzing the profitability of
              machine learning in the football betting industry
            </div>
            <div className="projectDescription">
              Evaluating the feasibility of both Recurrent Neural Networks and
              XGBoost based models to achieve sustained profitability in
              football betting markets.
            </div>
            <div className="project-links">
              <a href="pdf/report-ml2bet.pdf" target="_blank">
                <img src="img/report.png" />
              </a>
            </div>
          </div>

          <div class="project">
            <div class="projectTitle">
              Exploring a GPT-based methodology for competence mapping: a case
              study in telecommunications
            </div>
            <div class="projectDescription">
              Conducted in partnership with an Italian telecommunications firm,
              this academic project investigated the application of GPT-based
              models for optimizing workforce competence mapping.
            </div>
            <div className="project-links">
              <a href="pdf/report-aemfiber.pdf" target="_blank">
                <img src="img/report.png" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
