import './App.css';

function App() {
  return (
    <div className="App">
      <div class="container">
        <div class="header">
          <h1><strong>Francesco</strong> Zonaro</h1>

          <a style={{marginRight:"0.25em"}} href="" target="_blank"><img src="img/linkedin.png" /></a>
          <a style={{marginLeft:"0.25em"}} href="https://github.com/francescozonaro" target="_blank"><img src="img/github.png" /></a>
          <br></br>
          <a class="button" href="" target="_blank" style={{marginTop:"3em"}}>Résumé</a>

        </div>
        <div class="title">
          <h3>Projects</h3>
        </div>

        <div class="project">
          <div class="projectName">
              StatsbombPlot - From raw statsbomb data to interactive plots
              <span className='links'><a href="/"> [Work in progress] </a> </span>
          </div>
          <div class="project-viz">
            <img src="img/statsbomb.png" style={{height:"100px", width:"100%", objectFit:"cover"}}></img>
          </div>
        </div>

        <div class="project">
          <div class="projectName">
              Is there a profit to be made in the current betting market?
              <span className='links'><a href="/" target="_blank"> [Website] </a> </span>
          </div>
          <div class="project-viz">
            <img src="img/fzbets.png" style={{height:"100px", width:"100%", objectFit:"cover"}}></img>
          </div>
          <div class="separator"></div>
        </div>
        
      </div>
    </div>
  );
}

export default App;
