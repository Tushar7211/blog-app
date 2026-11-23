import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const empty = { title: '', author: '', content: '' };

export default function App() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);

  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch(`${API}/posts`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const addPost = useMutation({
    mutationFn: async (post) => {
      const res = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      setForm(empty);
    },
  });

  const deletePost = useMutation({
    mutationFn: (id) => fetch(`${API}/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    addPost.mutate(form);
  };

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', fontFamily: 'sans-serif' }}>
      <h1>My Blog</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, marginBottom: 30 }}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
        />
        <textarea
          placeholder="Content"
          rows={4}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />
        <button type="submit" disabled={addPost.isPending}>
          {addPost.isPending ? 'Posting...' : 'Create Post'}
        </button>
      </form>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Could not reach the backend.</p>}

      {posts.map((p) => (
        <div key={p._id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 10 }}>
          <h3>{p.title}</h3>
          <small>by {p.author}</small>
          <p>{p.content}</p>
          <button onClick={() => deletePost.mutate(p._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
