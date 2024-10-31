import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import StudioMode from './components/StudioMode';
import Footer from './components/Footer';
import ExamplesModal from './components/ExamplesModal';
import ModeSwitcher from './components/ModeSwitcher';
import UploadSection from './components/UploadSection';
import ProcessOptions from './components/ProcessOptions';
import WorkspaceHeader from './components/WorkspaceHeader';
import ImageGrid from './components/ImageGrid';
import WorkspaceFooter from './components/WorkspaceFooter';
import './styles/App.css';
import './styles/workspace.css';

function App() {
    const [activeTab, setActiveTab] = useState('removeBackground');
    const [showExamples, setShowExamples] = useState(false);

    return (
        <div className="app-container">
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <h1>For Seller</h1>
                    </div>
                    <div className="header-actions">
                        <span className="quota">일일 처리 가능: 10회</span>
                        <button className="help-button">도움말</button>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <aside className="sidebar">
                    <ModeSwitcher 
                        activeMode={activeTab} 
                        onModeChange={setActiveTab} 
                    />
                    <UploadSection />
                    <ProcessOptions />
                </aside>

                <section className="workspace">
                    <WorkspaceHeader />
                    <ImageGrid />
                    <WorkspaceFooter />
                </section>
            </main>
        </div>
    );
}

export default App;
