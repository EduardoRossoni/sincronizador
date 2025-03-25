import './assets/main.css'
import BuscarDadosGepec from './components/BuscarDadosGepec'
import DadosSalvosButton from './components/DadosSalvosButton'
import TabletConnectionButton from './components/TabletConnectionButton'
import GepecDataViewer from './components/GepecDataViewer'

import './Main.css'

function App(): JSX.Element {
  return (
    <div className="container">
      <h1 className="title">Sincronizar Gepec</h1>

      <div className="buttons-container">
        <BuscarDadosGepec />

        <TabletConnectionButton />

        <DadosSalvosButton />

        <GepecDataViewer />
      </div>
    </div>
  )
}

export default App
