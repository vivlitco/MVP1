import React, { useState, useEffect } from 'react';
import { Jar as JarType, User, JarDirection } from './types';
import Navbar from './components/Navbar';
import CreateJar from './components/CreateJar';
import JarView from './components/JarView';
import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import ShareModal from './components/ShareModal';
import ProfilePage from './components/ProfilePage';
import ConfirmationModal from './components/ConfirmationModal';
import AuthPage from './components/AuthPage';
import { VivlitLogo } from './components/icons';
import * as authService from './services/authService';
import * as dataService from './services/dataService';

type View = 'HOME' | 'CREATE_JAR' | 'VIEW_JAR' | 'PROFILE';
type AppState = 'LANDING' | 'AUTH' | 'APP' | 'SHARED_VIEW' | 'GUEST_CREATING';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('LANDING');
  const [view, setView] = useState<View>('HOME');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jars, setJars] = useState<JarType[]>([]);

  const [selectedJar, setSelectedJar] = useState<JarType | null>(null);
  const [jarToEdit, setJarToEdit] = useState<JarType | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [jarToShare, setJarToShare] = useState<JarType | null>(null);
  const [jarToDelete, setJarToDelete] = useState<JarType | null>(null);
  const [pendingJar, setPendingJar] = useState<JarType | null>(null);


  useEffect(() => {
    const initApp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const jarId = urlParams.get('jarId');
      if (jarId) {
        const sharedJar = await dataService.getSharedJar(jarId);
        if (sharedJar) {
          setSelectedJar(sharedJar);
          setAppState('SHARED_VIEW');
        }
      } else {
        const user = authService.getCurrentUser();
        if (user) {
          handleUserLogin(user);
        }
      }
    };
    initApp();
  }, []);

  const handleUserLogin = async (user: User) => {
    setCurrentUser(user);
    const userJars = await dataService.getJarsForUser(user.id);

    if (pendingJar) {
      const finalJar: JarType = {
        ...pendingJar,
        id: `jar-${Date.now()}`, // Temp ID, backend will ignore or replace
        senderName: user.name,
        sentDate: new Date().toISOString(),
        direction: JarDirection.SENT,
      };
      const updatedJars = await dataService.saveJarForUser(user.id, finalJar);
      setJars(updatedJars);
      setPendingJar(null);
    } else {
      setJars(userJars);
    }

    setAppState('APP');
    setView('HOME');
  };

  const handleSignOut = () => {
    authService.signOut();
    setCurrentUser(null);
    setJars([]);
    setAppState('AUTH');
  };

  const handleSaveJar = async (jarToSave: JarType) => {
    if (currentUser) {
      try {
        const updatedJars = await dataService.saveJarForUser(currentUser.id, jarToSave);
        setJars(updatedJars);
        setView('HOME');
        setJarToEdit(null);
      } catch (error) {
        alert("Failed to save jar. Please try again.");
      }
    } else {
      // Guest is trying to save a jar, prompt for authentication
      setPendingJar(jarToSave);
      setAppState('AUTH');
    }
  };

  const handleEditJar = (jar: JarType) => {
    setJarToEdit(jar);
    setView('CREATE_JAR');
  };

  const confirmDeleteJar = (jar: JarType) => {
    setJarToDelete(jar);
  };

  const handleDeleteJar = async () => {
    if (jarToDelete && currentUser) {
      try {
        const updatedJars = await dataService.deleteJarForUser(currentUser.id, jarToDelete.id);
        setJars(updatedJars);
        setJarToDelete(null);
      } catch (error) {
        alert("Failed to delete jar.");
      }
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const user = await authService.updateUser(updatedUser);
    if (user) {
      setCurrentUser(user);
      alert('Profile updated successfully!');
      setView('HOME');
    }
  };

  const handleSelectJar = (jar: JarType) => {
    setSelectedJar(jar);
    setView('VIEW_JAR');
  };

  const handleShareJar = (jar: JarType) => {
    setJarToShare(jar);
    setIsShareModalOpen(true);
  };

  const handleBackToHome = () => {
    setView('HOME');
    setSelectedJar(null);
    setJarToEdit(null);
    if (window.location.search) {
      window.history.pushState({}, '', window.location.pathname);
    }
    if (appState === 'SHARED_VIEW') {
      const user = authService.getCurrentUser();
      if (user) {
        handleUserLogin(user);
      } else {
        setAppState('LANDING');
      }
    }
  };

  const handleNavigate = (targetView: View) => {
    if (targetView === 'CREATE_JAR') {
      setJarToEdit(null);
    }
    setView(targetView);
  };

  const handleGoToCreate = () => {
    setJarToEdit(null);
    if (currentUser) {
      setView('CREATE_JAR');
    } else {
      setAppState('GUEST_CREATING');
    }
  };


  const renderAppContent = () => {
    if (!currentUser) return null;

    switch (view) {
      case 'PROFILE':
        return <ProfilePage user={currentUser} onUpdateUser={handleUpdateUser} onBack={handleBackToHome} onSignOut={handleSignOut} />;
      case 'CREATE_JAR':
        return <CreateJar onSaveJar={handleSaveJar} onBack={handleBackToHome} jarToEdit={jarToEdit} currentUser={currentUser} />;
      case 'VIEW_JAR':
        if (selectedJar) {
          return <JarView
            jar={selectedJar}
            onBack={handleBackToHome}
            onShare={handleShareJar}
            isSharedView={false}
          />;
        }
        handleBackToHome();
        return null;
      case 'HOME':
      default:
        return <HomePage
          jars={jars}
          onSelectJar={handleSelectJar}
          onGoToCreate={() => { setJarToEdit(null); setView('CREATE_JAR'); }}
          onEditJar={handleEditJar}
          onDeleteJar={confirmDeleteJar}
        />;
    }
  };

  const renderPage = () => {
    switch (appState) {
      case 'LANDING':
        return <LandingPage onEnter={() => setAppState('AUTH')} onGoToCreate={handleGoToCreate} />;
      case 'AUTH':
        return <AuthPage onAuthSuccess={handleUserLogin} />;
      case 'SHARED_VIEW':
        return selectedJar ? (
          <div className="min-h-screen">
            <Navbar user={null} onNavigate={() => { }} isSharedView={true} />
            <main className="pt-24">
              <JarView jar={selectedJar} onBack={handleBackToHome} onShare={() => { }} isSharedView={true} />
            </main>
          </div>
        ) : null;
      case 'GUEST_CREATING':
        return (
          <div className="min-h-screen">
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-24 flex justify-between items-center">
              <VivlitLogo className="w-32 h-auto text-purple-800" />
            </header>
            <main>
              <CreateJar
                onSaveJar={handleSaveJar}
                onBack={() => setAppState('LANDING')}
                jarToEdit={null}
                currentUser={null}
              />
            </main>
          </div>
        )
      case 'APP':
        if (!currentUser) return <AuthPage onAuthSuccess={handleUserLogin} />;
        return (
          <div className="min-h-screen">
            <Navbar user={currentUser} onNavigate={handleNavigate} isSharedView={false} />
            <main className="pt-24">
              {renderAppContent()}
            </main>
            {isShareModalOpen && jarToShare && (
              <ShareModal jar={jarToShare} onClose={() => setIsShareModalOpen(false)} />
            )}
            {jarToDelete && (
              <ConfirmationModal
                isOpen={!!jarToDelete}
                onClose={() => setJarToDelete(null)}
                onConfirm={handleDeleteJar}
                title="Delete Jar"
                message={`Are you sure you want to permanently delete the jar "${jarToDelete.name}"? This action cannot be undone.`}
              />
            )}
          </div>
        );
    }
  }

  return renderPage();
};

export default App;