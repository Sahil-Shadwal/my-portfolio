import './App.css';
import Terrain from './background/background';
import Tabs from './navbar/navbar';
import HomePage from './pages/homepage/homie';

function App() {
  return (
    <div className="App">
      <Tabs/>
      <Terrain/>
      <HomePage/>
    </div>
  );
}

export default App;
