const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const taskCount = document.getElementById('taskCount');
const clearAll = document.getElementById('clearAll');
const showAll = document.getElementById('showAll');
const showActive = document.getElementById('showActive');
const showCompleted = document.getElementById('showCompleted');
const filterInfo = document.getElementById('filterInfo');

let tasks = JSON.parse(localStorage.getItem('tasks_v1')||'[]');
let editingId = null;
let filter = 'all';

function save(){
  localStorage.setItem('tasks_v1', JSON.stringify(tasks));
  render();
}

function formatTime(ts){
  const d = new Date(ts);
  if (isNaN(d)) return '';
  return d.toLocaleString();
}

function render(){
  tasksList.innerHTML='';
  const filtered = tasks.filter(t=> filter==='all' ? true : (filter==='active' ? !t.completed : t.completed));
  taskCount.textContent = `Number of Tasks: ${tasks.length}`;

  if (filtered.length===0){ emptyState.style.display='block'; } else { emptyState.style.display='none'; }

  filtered.forEach(t=>{
    const li = document.createElement('li'); 
    li.className='task' + (t.completed? ' completed':'');
    const left = document.createElement('div'); left.className='task-left';

    const ch = document.createElement('div'); ch.className='ch' + (t.completed? ' checked':'');
    ch.addEventListener('click', ()=>{ t.completed = !t.completed; save(); });
    left.appendChild(ch);

    const titleWrap = document.createElement('div'); titleWrap.style.flex='1';
    const title = document.createElement('div'); title.className='task-title'; title.textContent = t.text;
    const meta = document.createElement('div'); meta.className='task-meta'; meta.textContent = `Created: ${formatTime(t.createdAt)}`;
    titleWrap.appendChild(title); titleWrap.appendChild(meta);
    left.appendChild(titleWrap);

    li.appendChild(left);

    const actions = document.createElement('div'); actions.className='actions';
    const edit = document.createElement('button'); edit.className='action'; edit.textContent='Edit';
    edit.onclick = ()=> startEdit(t.id);
    const del = document.createElement('button'); del.className='action'; del.textContent='Delete';
    del.onclick = ()=> deleteTask(t.id, li);
    actions.appendChild(edit); actions.appendChild(del);
    li.appendChild(actions);

    tasksList.appendChild(li);
  });
}

function deleteTask(id, element){
  element.style.transition = 'all 0.4s ease';
  element.style.opacity = '0';
  element.style.transform = 'translateX(50px)';
  setTimeout(()=>{
    tasks = tasks.filter(x=>x.id!==id);
    save();
  }, 400);
}

function startEdit(id){
  const t = tasks.find(x=>x.id===id); if(!t) return;
  editingId = id; taskInput.value = t.text;
  addBtn.textContent = 'Save Edit'; addBtn.classList.add('btn-primary'); taskInput.focus();
}

addBtn.addEventListener('click', ()=>{
  const text = taskInput.value.trim();
  if(!text) return alert('Please enter a task description.');

  if(editingId){
    const t = tasks.find(x=>x.id===editingId);
    if(t){ t.text = text; t.updatedAt = new Date().toISOString(); }
    editingId = null; addBtn.textContent='Add Task'; taskInput.value=''; save();
    return;
  }

  const newTask = { id: 't_'+Date.now(), text, createdAt: new Date().toISOString(), completed:false };
  tasks.unshift(newTask);
  taskInput.value=''; save();
});

clearAll.addEventListener('click', ()=>{
  if(!tasks.length) return;
  if(confirm('Clear all tasks?')){ tasks = []; save(); }
});

showAll.addEventListener('click', ()=>{ filter='all'; filterInfo.textContent='All tasks'; render(); });
showActive.addEventListener('click', ()=>{ filter='active'; filterInfo.textContent='Active tasks'; render(); });
showCompleted.addEventListener('click', ()=>{ filter='completed'; filterInfo.textContent='Completed tasks'; render(); });

render();
taskInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') addBtn.click(); });
