
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CoachOnboardingData, MarketItem, UserRole, Language, KnowledgeBaseItem, User } from '../types';

type AdminTab = 'accounts' | 'coaches' | 'homepage' | 'footer' | 'store' | 'ai-config';

const Admin: React.FC = () => {
    const { 
        logout, 
        users, 
        coaches, 
        registerCoach,
        updateCoach,
        marketItems, 
        addMarketItem, 
        updateMarketItem, 
        deleteMarketItem,
        language, 
        showToast,
        siteConfig,
        updateSiteConfig,
        translations,
        updateTranslations,
        knowledgeBase,
        addKnowledgeItem,
        updateKnowledgeItem,
        deleteKnowledgeItem
    } = useAppContext();
    
    const t = translations[language];
    const [activeTab, setActiveTab] = useState<AdminTab>('accounts');
    
    // Coach State
    const [showAddCoachForm, setShowAddCoachForm] = useState(false);
    const [editingCoachId, setEditingCoachId] = useState<string | null>(null);
    const [newCoach, setNewCoach] = useState<CoachOnboardingData>({ name: '', email: '', phone: '', specialty: '', bio: '', experienceYears: '', clientsHelped: '', avatar: '', password: '' });
    
    // Store State
    const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
    const [newItem, setNewItem] = useState<Omit<MarketItem, 'id'>>({ 
        name: '', description: '', summary: '', price: 0, image: '', category: 'meal',
        ingredients: '', caution: '',
        nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
    });

    // Text Management State
    const [heroTitleEn, setHeroTitleEn] = useState(translations.en.heroTitle);
    const [heroTitleAr, setHeroTitleAr] = useState(translations.ar.heroTitle);
    const [heroSubtitleEn, setHeroSubtitleEn] = useState(translations.en.heroSubtitle);
    const [heroSubtitleAr, setHeroSubtitleAr] = useState(translations.ar.heroSubtitle);
    const [heroImage, setHeroImage] = useState(siteConfig.heroImage);

    const [footerDescEn, setFooterDescEn] = useState(translations.en.footerDesc);
    const [footerDescAr, setFooterDescAr] = useState(translations.ar.footerDesc);
    const [footerCopyrightEn, setFooterCopyrightEn] = useState(translations.en.copyright);
    const [footerCopyrightAr, setFooterCopyrightAr] = useState(translations.ar.copyright);

    // AI Knowledge Base State
    const [editingKBItem, setEditingKBItem] = useState<KnowledgeBaseItem | null>(null);
    const [newKBItem, setNewKBItem] = useState({ question: '', answer: '', keywords: '' });

    const handleCoachInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewCoach({ ...newCoach, [e.target.name]: e.target.value });
    };

    const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('nut-')) {
            const nutField = name.replace('nut-', '');
            setNewItem({
                ...newItem,
                nutrition: {
                    ...(newItem.nutrition || { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }),
                    [nutField]: value
                }
            });
        } else {
            setNewItem({ ...newItem, [name]: name === 'price' ? parseFloat(value) : value });
        }
    };

    const handleSaveCoach = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoach.name || !newCoach.phone || !newCoach.specialty) {
             showToast('Please fill all required coach fields.', 'error');
             return;
        }
        if (editingCoachId) {
            updateCoach(editingCoachId, newCoach);
            setEditingCoachId(null);
        } else {
            registerCoach(newCoach);
        }
        setNewCoach({ name: '', email: '', phone: '', specialty: '', bio: '', experienceYears: '', clientsHelped: '', avatar: '', password: '' });
        setShowAddCoachForm(false);
    };

    const handleEditCoachClick = (coach: any) => {
        const userDetails = users.find(u => u.id === coach.id);
        setNewCoach({
            name: coach.name,
            email: userDetails?.email || '',
            phone: userDetails?.phone || '',
            specialty: coach.specialty,
            bio: coach.bio,
            experienceYears: coach.experienceYears.toString(),
            clientsHelped: coach.clientsHelped.toString(),
            avatar: coach.avatar,
            password: '' 
        });
        setEditingCoachId(coach.id);
        setShowAddCoachForm(true);
    };

    const handleCancelCoachEdit = () => {
        setEditingCoachId(null);
        setNewCoach({ name: '', email: '', phone: '', specialty: '', bio: '', experienceYears: '', clientsHelped: '', avatar: '', password: '' });
        setShowAddCoachForm(false);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.description || newItem.price <= 0 || !newItem.image) {
            showToast('Please fill all item fields correctly.', 'error');
            return;
        }
        addMarketItem(newItem);
        setNewItem({ 
            name: '', description: '', summary: '', price: 0, image: '', category: 'meal',
            ingredients: '', caution: '',
            nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
        });
    };
    
    const handleUpdateItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        updateMarketItem({ ...newItem, id: editingItem.id });
        setEditingItem(null);
        setNewItem({ 
            name: '', description: '', summary: '', price: 0, image: '', category: 'meal',
            ingredients: '', caution: '',
            nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
        });
    };

    const handleEditItemClick = (item: MarketItem) => {
        setEditingItem(item);
        setNewItem({
            ...item,
            nutrition: item.nutrition || { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
        });
    };
    
    const handleCancelEdit = () => {
        setEditingItem(null);
        setNewItem({ 
            name: '', description: '', summary: '', price: 0, image: '', category: 'meal',
            ingredients: '', caution: '',
            nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
        });
    };

    const handleDeleteItem = (itemId: string) => {
        if (window.confirm(t.confirmDelete)) {
            deleteMarketItem(itemId);
        }
    };
    
    const handleSaveHomePage = () => {
        const newTranslations = { ...translations };
        newTranslations.en.heroTitle = heroTitleEn;
        newTranslations.ar.heroTitle = heroTitleAr;
        newTranslations.en.heroSubtitle = heroSubtitleEn;
        newTranslations.ar.heroSubtitle = heroSubtitleAr;
        updateTranslations(newTranslations);
        updateSiteConfig({ heroImage });
    };

    const handleSaveFooter = () => {
        const newTranslations = { ...translations };
        newTranslations.en.footerDesc = footerDescEn;
        newTranslations.ar.footerDesc = footerDescAr;
        newTranslations.en.copyright = footerCopyrightEn;
        newTranslations.ar.copyright = footerCopyrightAr;
        updateTranslations(newTranslations);
    };

    const handleAddKBItem = () => {
        if(!newKBItem.question || !newKBItem.answer) {
            showToast('Please fill question and answer.', 'error');
            return;
        }
        addKnowledgeItem({
            question: newKBItem.question,
            answer: newKBItem.answer,
            keywords: newKBItem.keywords.split(',').map(k => k.trim()).filter(k => k)
        });
        setNewKBItem({ question: '', answer: '', keywords: '' });
    };

    const handleUpdateKBItem = () => {
        if(!editingKBItem || !newKBItem.question || !newKBItem.answer) return;
        updateKnowledgeItem({
            id: editingKBItem.id,
            question: newKBItem.question,
            answer: newKBItem.answer,
            keywords: newKBItem.keywords.split(',').map(k => k.trim()).filter(k => k)
        });
        setEditingKBItem(null);
        setNewKBItem({ question: '', answer: '', keywords: '' });
    };

    const handleEditKBClick = (item: KnowledgeBaseItem) => {
        setEditingKBItem(item);
        setNewKBItem({
            question: item.question,
            answer: item.answer,
            keywords: item.keywords.join(', ')
        });
    };

    const handleDeleteKBItem = (id: string) => {
        if (window.confirm('Delete this Q&A pair?')) {
            deleteKnowledgeItem(id);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'accounts':
                return (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white px-2">{t.users}</h3>
                        {/* Mobile Optimized View */}
                        <div className="md:hidden space-y-3">
                            {users.filter(u => u.role === UserRole.USER && u.id !== 'guest').map(user => (
                                <div key={user.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-bold">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t dark:border-gray-700">
                                        <span className="text-gray-500">{t.yourGoal}</span>
                                        <span className="font-semibold capitalize">{user.goal?.replace('_', ' ') || 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Desktop View */}
                        <div className="hidden md:block bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg">
                            <table className="w-full text-left">
                                <thead className="border-b dark:border-gray-700">
                                    <tr>
                                        <th className="p-4">{t.name}</th>
                                        <th className="p-4">{t.whatsYourPhone}</th>
                                        <th className="p-4">{t.yourGoal}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => u.role === UserRole.USER && u.id !== 'guest').map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="p-4 flex items-center gap-2">
                                                 <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} className="w-8 h-8 rounded-full" />
                                                 {user.name}
                                            </td>
                                            <td className="p-4">{user.phone}</td>
                                            <td className="p-4 capitalize">{user.goal?.replace('_', ' ') || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'coaches':
                 return (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t.existingCoaches}</h3>
                            <button onClick={() => { setEditingCoachId(null); setShowAddCoachForm(prev => !prev); }} className="bg-brand-green text-white py-2 px-5 rounded-full font-bold shadow-md active:scale-95 transition">
                                {showAddCoachForm && !editingCoachId ? t.close : t.addNewCoach}
                            </button>
                        </div>

                        {showAddCoachForm && (
                           <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg animate-slide-up border border-brand-green/20">
                               <h3 className="text-xl font-bold mb-6 text-brand-green">{editingCoachId ? t.editCoach : t.addNewCoach}</h3>
                               <form onSubmit={handleSaveCoach} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-1">
                                      <label className="text-xs font-bold text-gray-400 uppercase">{t.name}</label>
                                      <input type="text" name="name" value={newCoach.name} onChange={handleCoachInputChange} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-xs font-bold text-gray-400 uppercase">{t.phonePlaceholder}</label>
                                      <input type="text" name="phone" value={newCoach.phone} onChange={handleCoachInputChange} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-xs font-bold text-gray-400 uppercase">{t.specialty}</label>
                                      <input type="text" name="specialty" value={newCoach.specialty} onChange={handleCoachInputChange} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-xs font-bold text-gray-400 uppercase">{t.experience}</label>
                                      <input type="number" name="experienceYears" value={newCoach.experienceYears} onChange={handleCoachInputChange} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none" />
                                  </div>
                                  <div className="md:col-span-2 space-y-1">
                                      <label className="text-xs font-bold text-gray-400 uppercase">{t.bio}</label>
                                      <textarea name="bio" value={newCoach.bio} onChange={handleCoachInputChange} rows={3} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none" />
                                  </div>
                                  <div className="md:col-span-2 flex gap-3 pt-2">
                                      <button type="submit" className="flex-1 bg-brand-green text-white py-4 rounded-2xl font-bold shadow-glow transition active:scale-95">{editingCoachId ? t.updateCoach : t.addCoach}</button>
                                      {editingCoachId && <button type="button" onClick={handleCancelCoachEdit} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold active:scale-95 transition">{t.cancel}</button>}
                                  </div>
                               </form>
                           </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {coaches.map(coach => (
                                <div key={coach.id} className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src={coach.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-brand-green/20" />
                                        <div>
                                            <p className="font-bold text-lg">{coach.name}</p>
                                            <p className="text-xs text-brand-green font-bold uppercase tracking-wider">{coach.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 line-clamp-2 italic">"{coach.bio}"</p>
                                    </div>
                                    <div className="flex justify-between mt-6 pt-4 border-t dark:border-gray-700">
                                        <div className="text-center">
                                            <p className="text-lg font-black">{coach.experienceYears}+</p>
                                            <p className="text-[10px] text-gray-400 uppercase">Years</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-black">{coach.clientsHelped}+</p>
                                            <p className="text-[10px] text-gray-400 uppercase">Clients</p>
                                        </div>
                                        <button onClick={() => handleEditCoachClick(coach)} className="bg-gray-50 dark:bg-gray-800 p-2 px-4 rounded-full text-blue-500 font-bold text-sm self-center hover:bg-blue-50 transition-colors">
                                            {t.edit}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 );
            case 'ai-config':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                         <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
                            <h3 className="text-2xl font-bold mb-4">{t.existingQA}</h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {knowledgeBase.map(item => (
                                    <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border dark:border-gray-700 group hover:border-brand-green/30 transition-all">
                                        <p className="font-bold text-brand-green mb-1" dir="auto">Q: {item.question}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3" dir="auto">A: {item.answer}</p>
                                        <div className="flex justify-between items-center text-[10px] uppercase font-black text-gray-400">
                                            <span>Keywords: {item.keywords.join(', ')}</span>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleEditKBClick(item)} className="text-blue-500">{t.edit}</button>
                                                <button onClick={() => handleDeleteKBItem(item.id)} className="text-red-500">{t.delete}</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                         <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-brand-green/20">
                            <h3 className="text-2xl font-bold mb-6">{editingKBItem ? t.updateQA : t.addNewQA}</h3>
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">{t.question}</label>
                                    <input type="text" value={newKBItem.question} onChange={(e) => setNewKBItem({...newKBItem, question: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-green" dir="auto" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">{t.answer}</label>
                                    <textarea value={newKBItem.answer} onChange={(e) => setNewKBItem({...newKBItem, answer: e.target.value})} rows={5} className="w-full p-4 rounded-2xl border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-green" dir="auto" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">{t.keywords}</label>
                                    <input type="text" value={newKBItem.keywords} onChange={(e) => setNewKBItem({...newKBItem, keywords: e.target.value})} placeholder="word1, word2..." className="w-full p-4 rounded-2xl border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-green" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                     <button onClick={editingKBItem ? handleUpdateKBItem : handleAddKBItem} className="flex-1 bg-brand-green text-white py-4 rounded-2xl font-bold shadow-glow transition active:scale-95">
                                        {editingKBItem ? t.updateQA : t.addQA}
                                    </button>
                                    {editingKBItem && (
                                        <button onClick={() => { setEditingKBItem(null); setNewKBItem({question: '', answer: '', keywords: ''}); }} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold">
                                            {t.cancel}
                                        </button>
                                    )}
                                </div>
                            </div>
                         </div>
                    </div>
                );
            case 'store':
                 return (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        <div className="lg:col-span-1 bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg">
                             <h3 className="text-2xl font-bold mb-6">{t.storeManagement}</h3>
                             <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {marketItems.map(item => (
                                    <div key={item.id} className="flex items-center p-3 border rounded-2xl dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                                        <img src={item.image} className="w-14 h-14 rounded-xl object-cover" />
                                        <div className="flex-1 px-4">
                                            <p className="font-bold text-sm leading-tight">{item.name}</p>
                                            <p className="text-xs font-bold text-brand-green">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button onClick={() => handleEditItemClick(item)} className="p-1 px-3 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase">{t.edit}</button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="p-1 px-3 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase">{t.delete}</button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-brand-green/20">
                             <h3 className="text-2xl font-bold mb-6">{editingItem ? t.edit : t.addNewItem}</h3>
                             <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">{t.itemName}</label>
                                        <input type="text" name="name" value={newItem.name} onChange={handleItemInputChange} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Description Bubble</label>
                                        <input type="text" name="summary" value={newItem.summary} onChange={handleItemInputChange} placeholder="E.g. HIGH PROTEIN" className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">{t.price}</label>
                                        <input type="number" step="0.01" name="price" value={newItem.price} onChange={handleItemInputChange} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">{t.imageUrl}</label>
                                        <input type="text" name="image" value={newItem.image} onChange={handleItemInputChange} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">{t.category}</label>
                                        <select name="category" value={newItem.category} onChange={handleItemInputChange} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-green outline-none">
                                            <option value="meal">{t.meal}</option>
                                            <option value="drink">{t.drink}</option>
                                            <option value="breakfast">Breakfast</option>
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">Dinner</option>
                                            <option value="snack">Snack</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">{t.description}</label>
                                    <textarea name="description" value={newItem.description} onChange={handleItemInputChange} rows={3} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-green" />
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 bg-brand-green text-white py-4 rounded-2xl font-bold shadow-glow transition active:scale-95">{editingItem ? t.updateItem : t.addItem}</button>
                                    {editingItem && <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold">Cancel</button>}
                                </div>
                             </form>
                        </div>
                    </div>
                 );
            default:
                return <div className="text-center py-20 opacity-50">Feature Coming Soon</div>;
        }
    };

    const TabButton: React.FC<{ tab: AdminTab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 rounded-full font-bold transition-all whitespace-nowrap active:scale-90 ${activeTab === tab ? 'bg-brand-green text-white shadow-glow' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 md:p-8">
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black italic text-brand-green">ADMIN <span className="text-gray-900 dark:text-white">PANEL</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">NY11 Health System</p>
                </div>
                <button onClick={logout} className="bg-red-500 text-white p-2 px-6 rounded-full font-bold text-sm shadow-md active:scale-90 transition">
                    {t.logout}
                </button>
            </header>

            <div className="max-w-7xl mx-auto mb-8 flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
                <TabButton tab="accounts" label={t.users} />
                <TabButton tab="coaches" label={t.coaches} />
                <TabButton tab="ai-config" label={t.aiConfig} />
                <TabButton tab="store" label={t.storeManagement} />
                <TabButton tab="homepage" label={t.home} />
                <TabButton tab="footer" label="Footer" />
            </div>

            <div className="max-w-7xl mx-auto pb-20">
                {renderContent()}
            </div>
        </div>
    );
};

export default Admin;
