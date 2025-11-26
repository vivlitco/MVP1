import React, { useState, useMemo } from 'react';
import { Jar as JarType, JarDirection } from '../types';
import { PlusIcon, VivlitBunny, ArrowUpRightIcon, ArrowDownLeftIcon, MagicJarIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from './icons';

const JarMenu: React.FC<{ onEdit: () => void; onDelete: () => void; }> = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
      e.stopPropagation();
      action();
      setIsOpen(false);
    }

    return (
        <div className="absolute top-3 right-3 z-20">
            <button onClick={(e) => {e.stopPropagation(); setIsOpen(!isOpen);}} className="p-1.5 rounded-full text-purple-800/70 hover:bg-black/10 transition-colors">
                <EllipsisVerticalIcon className="w-6 h-6" />
            </button>
            {isOpen && (
                <div 
                  className="absolute right-0 mt-2 w-36 origin-top-right bg-white/50 backdrop-blur-xl rounded-xl shadow-lg ring-1 ring-black/10 focus:outline-none py-1"
                  onMouseLeave={() => setIsOpen(false)}
                >
                    <button onClick={(e) => handleButtonClick(e, onEdit)} className="flex items-center w-full px-4 py-2 text-sm text-purple-800 hover:bg-black/5">
                        <PencilIcon className="w-4 h-4 mr-3" />
                        Edit
                    </button>
                    <button onClick={(e) => handleButtonClick(e, onDelete)} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-black/5">
                        <TrashIcon className="w-4 h-4 mr-3" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}

const JarCard: React.FC<{ jar: JarType; onClick: () => void; onEdit: () => void; onDelete: () => void; }> = ({ jar, onClick, onEdit, onDelete }) => {
    const isSent = jar.direction === JarDirection.SENT;

    return (
        <div
            onClick={onClick}
            className="w-full relative group cursor-pointer aspect-[3/4] p-4 flex flex-col justify-between
                       bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-lg
                       transition-all duration-300 hover:shadow-violet-500/20 hover:border-white/70 hover:scale-105"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
        >
            <div className="absolute inset-0 rounded-3xl transition-all duration-300 opacity-0 group-hover:opacity-100" 
                 style={{background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%)'}}>
            </div>

            {isSent && <JarMenu onEdit={onEdit} onDelete={onDelete} />}
            
            <div className="flex-shrink-0 relative z-10">
                <MagicJarIcon className="w-10 h-10 text-purple-800/60" />
            </div>

            <div className="text-left relative z-10">
                 <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full mb-2 ${isSent ? 'bg-pink-500/20 text-pink-700' : 'bg-purple-500/20 text-purple-700'}`}>
                    {isSent ? 'Sent' : 'Received'}
                 </span>
                 <h3 className="text-lg font-bold text-purple-900 line-clamp-2">{jar.name}</h3>
                 <p className="text-xs text-purple-800/80 mt-1 italic line-clamp-3">"{jar.coverNote}"</p>
            </div>
        </div>
    );
};

const HomePage: React.FC<{
    jars: JarType[],
    onSelectJar: (jar: JarType) => void,
    onGoToCreate: () => void,
    onEditJar: (jar: JarType) => void,
    onDeleteJar: (jar: JarType) => void,
}> = ({ jars, onSelectJar, onGoToCreate, onEditJar, onDeleteJar }) => {
    const [activeTab, setActiveTab] = useState<'jars' | 'memoryLane'>('jars');
    const [filterContact, setFilterContact] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const contacts = useMemo(() => {
        const allContacts = new Set<string>();
        jars.forEach(jar => {
            allContacts.add(jar.direction === JarDirection.SENT ? jar.recipientName : jar.senderName);
        });
        return Array.from(allContacts).sort();
    }, [jars]);

    const memoryLaneJars = useMemo(() => {
        return jars
            .filter(jar => {
                if (filterContact && (jar.recipientName !== filterContact && jar.senderName !== filterContact)) return false;
                const sentDate = new Date(jar.sentDate);
                if (filterStartDate) {
                     const start = new Date(filterStartDate);
                     start.setHours(0,0,0,0);
                     if (sentDate < start) return false;
                }
                if (filterEndDate) {
                    const end = new Date(filterEndDate);
                    end.setHours(23,59,59,999);
                    if (sentDate > end) return false;
                }
                return true;
            })
            .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
    }, [jars, filterContact, filterStartDate, filterEndDate]);
    
    const resetFilters = () => {
        setFilterContact('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 border-b border-black/10">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('jars')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-xl transition-colors ${activeTab === 'jars' ? 'border-pink-500 text-purple-800' : 'border-transparent text-purple-600 hover:text-purple-800 hover:border-purple-400/50'}`}>
                        Your Jars
                    </button>
                    <button onClick={() => setActiveTab('memoryLane')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-xl transition-colors ${activeTab === 'memoryLane' ? 'border-pink-500 text-purple-800' : 'border-transparent text-purple-600 hover:text-purple-800 hover:border-purple-400/50'}`}>
                        Memory Lane
                    </button>
                </nav>
            </div>

            {activeTab === 'jars' && (
                <>
                {jars.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {jars.map(jar => (
                            <JarCard key={jar.id} jar={jar} onClick={() => onSelectJar(jar)} onEdit={() => onEditJar(jar)} onDelete={() => onDeleteJar(jar)} />
                        ))}
                        <button onClick={onGoToCreate} className="w-full aspect-[3/4] p-6 border-2 border-dashed border-black/20 rounded-3xl text-purple-700 hover:bg-black/5 hover:border-black/30 transition-all duration-300 flex flex-col items-center justify-center group">
                            <PlusIcon className="w-12 h-12 mb-2 text-black/20 group-hover:text-black/40 transition-colors" />
                            <span className="font-bold text-center">Create New</span>
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <VivlitBunny className="w-40 h-40 mx-auto" />
                        <h2 className="mt-6 text-3xl font-bold text-purple-900">Your shelf is empty!</h2>
                        <p className="mt-2 text-purple-800 text-lg">Why not create a jar of notes for someone special?</p>
                        <button onClick={onGoToCreate} className="mt-8 px-8 py-3 bg-pink-500 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50">
                            Create Your First Jar
                        </button>
                    </div>
                )}
                </>
            )}

            {activeTab === 'memoryLane' && (
                 <div className="max-w-4xl mx-auto">
                    <div className="p-4 bg-white/30 backdrop-blur-xl rounded-xl shadow-lg mb-8 flex flex-wrap gap-4 items-center border border-black/10">
                        <div className="flex-grow min-w-[150px]">
                            <label htmlFor="contact-filter" className="block text-sm font-medium text-purple-800">Contact</label>
                            <select id="contact-filter" value={filterContact} onChange={e => setFilterContact(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white/50 border border-black/20 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-purple-900">
                                <option value="">All Contacts</option>
                                {contacts.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex-grow min-w-[120px]">
                             <label htmlFor="start-date" className="block text-sm font-medium text-purple-800">From</label>
                             <input type="date" id="start-date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="mt-1 block w-full p-2 bg-white/50 border border-black/20 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-purple-900" />
                        </div>
                         <div className="flex-grow min-w-[120px]">
                             <label htmlFor="end-date" className="block text-sm font-medium text-purple-800">To</label>
                             <input type="date" id="end-date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="mt-1 block w-full p-2 bg-white/50 border border-black/20 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-purple-900" />
                        </div>
                        <div className="self-end pt-5">
                            <button onClick={resetFilters} className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700">Reset</button>
                        </div>
                    </div>
                    {/* Feed */}
                    <div className="space-y-4">
                        {memoryLaneJars.map(jar => {
                            const isSent = jar.direction === JarDirection.SENT;
                            return (
                                <div key={jar.id} onClick={() => onSelectJar(jar)} className="bg-white/30 backdrop-blur-xl rounded-xl shadow-lg border border-black/10 p-4 flex items-center space-x-4 hover:bg-white/50 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isSent ? 'bg-pink-500/20' : 'bg-purple-500/20'}`}>
                                        {isSent ? <ArrowUpRightIcon className="w-6 h-6 text-pink-700" /> : <ArrowDownLeftIcon className="w-6 h-6 text-purple-700" />}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-lg font-bold text-purple-900">{jar.name}</p>
                                        <p className="text-sm text-purple-700">{isSent ? `To: ${jar.recipientName}` : `From: ${jar.senderName}`}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-semibold text-purple-800">{new Date(jar.sentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                        <p className="text-xs text-purple-600">{new Date(jar.sentDate).getFullYear()}</p>
                                    </div>
                                </div>
                            )
                        })}
                         {memoryLaneJars.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-purple-700 text-lg">No memories found for these filters.</p>
                             </div>
                         )}
                    </div>
                 </div>
            )}
        </div>
    );
};

export default HomePage;