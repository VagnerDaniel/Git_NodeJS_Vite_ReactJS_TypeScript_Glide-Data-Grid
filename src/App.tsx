import { useState } from 'react'
import './index.css'

import MyGlideGrid from './components/MyGlideGrid'
import { type GridColumn } from '@glideapps/glide-data-grid'

const columns: GridColumn[] = [
  { id: 'id', title: 'ID', width: 50 },
  { id: 'nome', title: 'Nome', width: 180, group: 'Pessoal' },
  { id: 'idade', title: 'Idade', width: 80, group: 'Pessoal' },
  { id: 'email', title: 'E-mail', width: 220, group: 'Contato' },
  { id: 'status', title: 'Status', width: 120, group: 'Status' },
]

const powerColumns: GridColumn[] = [
  { id: 'rowId', title: 'UUID', width: 80 },
  { id: 'avatar', title: 'Avatar', width: 60 },
  { id: 'nome', title: 'Nome Completo', width: 180, group: 'Identidade' },
  { id: 'bio', title: 'Biografia (Markdown)', width: 300, group: 'Identidade' },
  { id: 'habilidades', title: 'Habilidades', width: 250, group: 'Profissional' },
  { id: 'portfolio', title: 'Link Portfólio', width: 200, group: 'Profissional' },
  { id: 'progresso', title: 'Nível de Senioridade', width: 150, group: 'Status' },
]

const initialData = [
  { id: 1, nome: 'Ana Silva', idade: 22, ativo: true, progresso: 80, email: 'ana@exemplo.com', status: 'Ativo' },
  { id: 2, nome: 'Pedro Santos', idade: 34, ativo: false, progresso: 30, email: 'pedro@exemplo.com', status: 'Inativo' },
]

const powerData = [
  {
    id: 1,
    rowId: 'USR-001',
    avatar: 'https://i.pravatar.cc/150?u=ana',
    nome: 'Ana Beatrix',
    bio: 'Engenheira de **Software** apaixonada por *React* e grids de alta performance. \n\n > Foco em UX.',
    habilidades: ['React', 'TypeScript', 'Node.js', 'Vite'],
    portfolio: 'https://github.com/ana',
    progresso: 85
  },
  {
    id: 2,
    rowId: 'USR-002',
    avatar: 'https://i.pravatar.cc/150?u=pedro',
    nome: 'Pedro Alvares',
    bio: 'Desenvolvedor **Fullstack** e entusiasta de *Cloud Computing*. \n\n Certificado AWS.',
    habilidades: ['Python', 'Docker', 'AWS', 'Go'],
    portfolio: 'https://pedro.dev',
    progresso: 60
  },
  {
    id: 3,
    rowId: 'USR-003',
    avatar: 'https://i.pravatar.cc/150?u=lucas',
    nome: 'Lucas Mendes',
    bio: 'Especialista em **Cibersegurança**. \n\n "Security first".',
    habilidades: ['Kali', 'Linux', 'Pentest'],
    portfolio: 'https://lucas.security',
    progresso: 95
  },
]

function App() {
  const [activeTab, setActiveTab] = useState<'power' | 'all' | 'readonly'>('power');

  return (
    <div className="enterprise-container">
      <header className="main-header" style={{ marginBottom: '2.5rem' }}>
        <h1 className="main-title">
          <span>Enterprise</span> Data Matrix PRO
        </h1>
        <p style={{ color: 'var(--enterprise-text-subtle)', marginTop: '-1.5rem', fontSize: '0.95rem' }}>
          Plataforma Unificada de Gestão de Dados
        </p>
      </header>

      <nav className="enterprise-tabs" style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn-enterprise ${activeTab === 'power' ? 'active' : ''}`}
          onClick={() => setActiveTab('power')}
        >
          ⚡ Power Matrix (Full Glide)
        </button>
        <button
          className={`btn-enterprise ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Operational Grid
        </button>
        <button
          className={`btn-enterprise ${activeTab === 'readonly' ? 'active' : ''}`}
          onClick={() => setActiveTab('readonly')}
        >
          Audit View
        </button>
      </nav>

      <main className="grid-display-area">
        {activeTab === 'power' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Super Power Matrix <small style={{ fontWeight: 400, opacity: 0.7 }}>(Markdown, Imagens, Agrupamento, Reordenação)</small></h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--enterprise-primary)', fontWeight: 600 }}>
                💡 Dica: Arraste as linhas e veja o agrupamento no topo
              </div>
            </div>
            <MyGlideGrid
              columns={powerColumns}
              initialData={powerData}
              features={{
                selection: true,
                search: { active: true, animation: "slide-left", offsetX: "40px", offsetY: "10px" },
                editing: true,
                sorting: true,
                columnReorder: true,
                columnResize: true,
                rowReorder: true,
                rowAppend: true,
                columnMenu: true,
                rowMenu: true,
                stats: true,
                locking: true,
                freezeColumns: 2
              }}
              dataEditorProps={{
                headerHeight: 48,
                rowHeight: 60,
                verticalBorder: true
              }}
            />
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Standard Operations <small style={{ fontWeight: 400, opacity: 0.7 }}>(Grouped Headers)</small></h3>
            <MyGlideGrid
              preset="default"
              columns={columns}
              initialData={initialData}
              features={{
                selection: true,
                search: { active: true, animation: "slide-left" },
                editing: true,
                sorting: true,
                columnReorder: true,
                columnResize: true,
                rowAppend: true,
                columnMenu: true,
                rowMenu: true,
                stats: true,
                locking: true,
              }}
            />
          </div>
        )}

        {activeTab === 'readonly' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Audit Control <small style={{ fontWeight: 400, opacity: 0.7 }}>(Read Only)</small></h3>
            <MyGlideGrid
              preset="readOnly"
              columns={columns}
              initialData={initialData}
              features={{ search: { active: true, animation: "show" }, stats: true }}
            />
          </div>
        )}
      </main>

      <footer style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--enterprise-border)', textAlign: 'center', color: 'var(--enterprise-text-subtle)', fontSize: '0.85rem' }}>
        Enterprise Grid System &copy; 2026 - Optimized for high density data visualization.
      </footer>
    </div>
  )
}

export default App
