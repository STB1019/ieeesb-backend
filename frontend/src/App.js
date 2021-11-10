import './App.css';

function App() {
  return (
    <form action="/articles" method="post" encType="multipart/form-data">
      <div>
        <label htmlFor="title">Titolo:</label><br/>
        <input name="title" id="title" type="text" />
      </div>
      <br/>
      <div>
        <label htmlFor="snippet">Snippet:</label><br/>
        <input name="snippet" id="snippet" type="text" />
      </div>
      <br/>
      <div>
        <label htmlFor="content">Contenuto:</label><br/>
        <textarea name="content" id="content" cols="30" rows="10"></textarea>
      </div>
      <br/>
      <div>
        <input name="images" id="images" type="file" multiple />
      </div>
      <br/>
      <div>
        <input type="submit" value="Invia" />
      </div>
    </form>
  );
}

export default App;
