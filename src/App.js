import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabase = createClient(
  'https://xkkowjsirgtqpncrizqv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhra293anNpcmd0cXBuY3JpenF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzQyNDQsImV4cCI6MjA4Mjk1MDI0NH0.b5WJVGH6ZXzwoyCy6yTGkUKuL0futQRwfPUMpEVxyW0'
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      loadTasks();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && selectedTask) {
        setSelectedTask(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedTask]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Görevler yüklenemedi:', error);
    } else {
      setTasks(data || []);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'umut' && password === '3434') {
      setIsLoggedIn(true);
    } else {
      alert('Kullanıcı adı veya şifre hatalı!');
    }
  };

  const addTask = async (status) => {
  if (!newTaskTitle.trim()) return;
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title: newTaskTitle,
      status: status,
      notes: [],
      created_at: new Date().toISOString()  // BU SATIRI EKLE
    }])
    .select();
  
  if (error) {
    console.error('Görev eklenemedi:', error);
  } else {
    setTasks([data[0], ...tasks]);
    setNewTaskTitle('');
    setShowAddForm(null);
  }
};

  const deleteTask = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error('Görev silinemedi:', error);
    } else {
      setTasks(tasks.filter(task => task.id !== taskId));
      setSelectedTask(null);
    }
  };

  const updateTaskStatus = async (taskId, newStatus, oldStatus) => {
    const task = tasks.find(t => t.id === taskId);
    const completedAt = newStatus === 'done' && oldStatus !== 'done' 
      ? new Date().toISOString() 
      : newStatus === 'done' 
        ? task?.completed_at 
        : null;

    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status: newStatus,
        completed_at: completedAt
      })
      .eq('id', taskId)
      .select();
    
    if (error) {
      console.error('Görev güncellenemedi:', error);
    } else {
      const updatedTasks = tasks.map(t => t.id === taskId ? data[0] : t);
      setTasks(updatedTasks);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(data[0]);
      }
    }
  };

  const handleDrop = (status) => {
    if (draggedTask) {
      updateTaskStatus(draggedTask.id, status, draggedTask.status);
      setDraggedTask(null);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      text: newNote,
      createdAt: new Date().toISOString()
    };

    const updatedNotes = [...(selectedTask.notes || []), note];

    const { data, error } = await supabase
      .from('tasks')
      .update({ notes: updatedNotes })
      .eq('id', selectedTask.id)
      .select();
    
    if (error) {
      console.error('Not eklenemedi:', error);
    } else {
      const updatedTasks = tasks.map(task => task.id === selectedTask.id ? data[0] : task);
      setTasks(updatedTasks);
      setSelectedTask(data[0]);
      setNewNote('');
    }
  };

  const deleteNote = async (noteId) => {
    const updatedNotes = selectedTask.notes.filter(note => note.id !== noteId);

    const { data, error } = await supabase
      .from('tasks')
      .update({ notes: updatedNotes })
      .eq('id', selectedTask.id)
      .select();
    
    if (error) {
      console.error('Not silinemedi:', error);
    } else {
      const updatedTasks = tasks.map(task => task.id === selectedTask.id ? data[0] : task);
      setTasks(updatedTasks);
      setSelectedTask(data[0]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
        <div style={{ background: 'white', padding: '50px 40px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Umut'un Takvimi</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Görevlerinizi organize edin</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Kullanıcı Adı</label>
            <input type="text" placeholder="" value={username} onChange={(e) => setUsername(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)} style={{ display: 'block', width: '100%', padding: '14px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '15px' }} />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Şifre</label>
            <input type="password" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)} style={{ display: 'block', width: '100%', padding: '14px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '15px' }} />
          </div>
          
          <button onClick={handleLogin} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>Giriş Yap →</button>
        </div>
      </div>
    );
  }

  const columns = [
    { id: 'todo', title: 'To Do', emoji: '📝', color: '#f1f5f9', accentColor: '#64748b' },
    { id: 'inprogress', title: 'In Progress', emoji: '⚡', color: '#dbeafe', accentColor: '#3b82f6' },
    { id: 'done', title: 'Done', emoji: '✅', color: '#dcfce7', accentColor: '#22c55e' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '25px 35px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '40px' }}>📋</span>
            <div>
              <h1 style={{ fontSize: '32px', color: '#1e293b', fontWeight: 'bold', margin: 0 }}>Umut'un Takvimi</h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>{tasks.length} toplam görev</p>
            </div>
          </div>
          <button onClick={() => {setIsLoggedIn(false); setUsername(''); setPassword('');}} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>🚪 Çıkış</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
          {columns.map(column => (
            <div key={column.id} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(column.id)} style={{ background: 'white', borderRadius: '20px', padding: '25px', minHeight: '700px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `3px solid ${column.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '20px', borderBottom: `2px solid ${column.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>{column.emoji}</span>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{column.title}</h2>
                    <span style={{ fontSize: '13px', color: column.accentColor, fontWeight: '600' }}>{getTasksByStatus(column.id).length} görev</span>
                  </div>
                </div>
                <button onClick={() => setShowAddForm(column.id)} style={{ background: column.accentColor, color: 'white', border: 'none', borderRadius: '12px', width: '40px', height: '40px', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', boxShadow: `0 4px 12px ${column.accentColor}40` }}>+</button>
              </div>

              {showAddForm === column.id && (
                <div style={{ background: column.color, padding: '20px', borderRadius: '16px', marginBottom: '20px', border: `2px solid ${column.accentColor}30` }}>
                  <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask(column.id)} placeholder="Görev başlığını yazın..." autoFocus style={{ width: '100%', padding: '14px 16px', border: '2px solid white', borderRadius: '12px', marginBottom: '12px', fontSize: '15px' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => addTask(column.id)} style={{ flex: 1, padding: '12px', background: column.accentColor, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>✓ Ekle</button>
                    <button onClick={() => {setShowAddForm(null); setNewTaskTitle('');}} style={{ padding: '12px 20px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>✕</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {getTasksByStatus(column.id).map(task => (
                  <div key={task.id} draggable onDragStart={() => setDraggedTask(task)} onClick={() => setSelectedTask(task)} style={{ background: 'white', padding: '18px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: `2px solid ${column.color}`, borderLeft: `5px solid ${column.accentColor}`, transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>📌</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px', fontSize: '15px', lineHeight: '1.5' }}>{task.title}</p>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {task.notes && task.notes.length > 0 && (
                            <span style={{ fontSize: '12px', color: column.accentColor, background: column.color, padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>📝 {task.notes.length} not</span>
                          )}
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>🕐 {formatDate(task.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTask && (
        <div onClick={(e) => e.target === e.currentTarget && setSelectedTask(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px', fontWeight: '600' }}>📋 GÖREV DETAYI</div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0, lineHeight: '1.3' }}>{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ padding: '35px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' }}>
                <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', padding: '20px', borderRadius: '16px', border: '2px solid #3b82f6' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', marginBottom: '10px' }}>📅 OLUŞTURULMA</div>
                  <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>{formatDate(selectedTask.created_at)}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', padding: '20px', borderRadius: '16px', border: '2px solid #22c55e' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#15803d', marginBottom: '10px' }}>⏰ TAMAMLANMA</div>
                  <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>{formatDate(selectedTask.completed_at)}</div>
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📝</span>
                  Notlar 
                  <span style={{ fontSize: '14px', background: '#f1f5f9', padding: '4px 12px', borderRadius: '8px', fontWeight: '600', color: '#64748b' }}>{selectedTask.notes?.length || 0}</span>
                </h3>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addNote()} placeholder="Yeni not ekleyin..." style={{ flex: 1, padding: '14px 18px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '15px' }} />
                  <button onClick={addNote} style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>➕ Ekle</button>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#f8fafc', borderRadius: '16px', padding: '15px' }}>
                  {selectedTask.notes && selectedTask.notes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[...selectedTask.notes].reverse().map(note => (
                        <div key={note.id} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>🕐 {formatDate(note.createdAt)}</span>
                            <button onClick={() => deleteNote(note.id)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', width: '32px', height: '32px', borderRadius: '8px' }}>🗑️</button>
                          </div>
                          <p style={{ color: '#1e293b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{note.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px', fontSize: '15px' }}>📝 Henüz not eklenmemiş</p>
                  )}
                </div>
              </div>

              <button onClick={() => deleteTask(selectedTask.id)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>🗑️ Görevi Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;