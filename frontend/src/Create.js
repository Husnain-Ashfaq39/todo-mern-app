import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50010';

const Create = () => {
    const [task, setTask] = useState('');

    const createTask = () => {
        axios.post(`${API_URL}/add`, { task: task.trim() })
            .then(result => {
                console.log(result.data);
                window.location.reload();
                setTask('');
            })
            .catch(err => console.log(err));
    };

    return (
        <main>
            <h1>Todo List Husnain</h1>
            <div className='create-form'>
                <input
                    type='text'
                    placeholder='Enter a task'
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    required
                />
                <button onClick={createTask}>ADD</button>
            </div>
        </main>
    );
};

export default Create;
