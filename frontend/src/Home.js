import React, { useEffect, useState } from 'react';
import Create from './Create';
import './App.css';
import axios from 'axios';
import { BsCircleFill, BsFillCheckCircleFill, BsFillTrashFill, BsPencil, BsSave } from 'react-icons/bs';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50010';

const Home = () => {
    const [todos, setTodos] = useState([]);
    const [updatetask, setUpdatetask] = useState('');
    const [taskid, setTaskid] = useState('');

    useEffect(() => {
        axios.get(`${API_URL}/get`)
            .then(result => setTodos(result.data))
            .catch(err => console.log(err));
    }, []);

    const edit = (id) => {
        axios.put(`${API_URL}/edit/${id}`)
            .then(result => {
                console.log(result.data);
                const updatedTodos = todos.map(todo => {
                    if (todo._id === id) {
                        return { ...todo, done: !todo.done };
                    }
                    return todo;
                });
                setTodos(updatedTodos);
            })
            .catch(err => console.log(err));
    };

    const Update = (id, updatedTask) => {
        axios.put(`${API_URL}/update/${id}`, { task: updatedTask })
            .then(result => {
                console.log(result.data);
                const updatedTodos = todos.map(todo => {
                    if (todo._id === id) {
                        return { ...todo, task: updatedTask };
                    }
                    return todo;
                });
                setTodos(updatedTodos);
                setTaskid('');
                setUpdatetask('');
                window.location.reload();
            })
            .catch(err => console.log(err));
    };

    const Hdelete = (id) => {
        // Add confirmation dialog
        if (window.confirm('Are you sure you want to delete this task?')) {
            axios.delete(`${API_URL}/delete/${id}`)
                .then(result => {
                    console.log(result.data);
                    const updatedTodos = todos.filter(todo => todo._id !== id);
                    setTodos(updatedTodos);
                })
                .catch(err => console.log(err));
        }
    };

    // Format timestamp to human-readable format
    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        
        const now = new Date();
        const created = new Date(timestamp);
        const diffInSeconds = Math.floor((now - created) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    return (
        <main>
            <Create />
            {
                todos.length === 0 ? <div className='task'>No tasks found</div> :
                    todos.map((todo) => (
                        <div className='task' key={todo._id}>
                            <div className='checkbox'>
                                {todo.done ? <BsFillCheckCircleFill className='icon' /> :
                                    <BsCircleFill className='icon' onClick={() => edit(todo._id)} />}
                                {taskid === todo._id ? (
                                    <div className="editing-container">
                                        <input 
                                            type='text' 
                                            value={updatetask} 
                                            onChange={e => setUpdatetask(e.target.value)} 
                                            className="edit-input"
                                        />
                                    </div>
                                ) : (
                                    <div className="task-content">
                                        <p className={todo.done ? 'through' : 'normal'}>{todo.task}</p>
                                        <span className="timestamp">{formatTimeAgo(todo.createdAt)}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <span>
                                    {taskid === todo._id ? (
                                        <BsSave 
                                            className='icon save-icon' 
                                            onClick={() => Update(todo._id, updatetask)}
                                            title="Save" 
                                        />
                                    ) : (
                                        <BsPencil 
                                            className='icon edit-icon' 
                                            onClick={() => {
                                                setTaskid(todo._id);
                                                setUpdatetask(todo.task);
                                            }}
                                            title="Edit"
                                        />
                                    )}
                                    <BsFillTrashFill 
                                        className='icon delete-icon' 
                                        onClick={() => Hdelete(todo._id)}
                                        title="Delete" 
                                    />
                                </span>
                            </div>
                        </div>
                    ))
            }
        </main>
    );
};

export default Home;
