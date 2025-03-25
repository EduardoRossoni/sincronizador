import './assets/main.css'
import BuscarDadosGepec from './components/BuscarDadosGepec'
import DadosSalvosButton from './components/DadosSalvosButton';

import './Main.css'

function App(): JSX.Element {
  return (
    <div className="container">
      <h1 className="title">Sincronizar Gepec</h1>

      <div className="buttons-container">
        <BuscarDadosGepec />

        <button className="action-button">Abrir Conexão Tablet</button>

        <DadosSalvosButton />
      </div>
    </div>
  )
}

export default App
