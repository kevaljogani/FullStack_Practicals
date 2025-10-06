import React, { useState } from 'react';
import './App.css';

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // { type: 'success'|'error', text }
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return 'Please fill in all fields.';
    }
    // simple email regex
      // simple email regex (lint-safe)
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(form.email)) return 'Please enter a valid email address.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    const err = validate();
    if (err) return setStatus({ type: 'error', text: err });

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        let text = 'Message sent — thanks!';
        if (json.previewUrl) text += ` Preview: ${json.previewUrl}`;
        setStatus({ type: 'success', text });
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', text: json.error || 'Failed to send message.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Network error — try again later.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="contact-container">
      <h2>Contact me</h2>
      <form onSubmit={handleSubmit} className="contact-form">
        <label>
          Name
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Message
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </label>

        <button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Submit'}</button>
      </form>

      {status && (
        <div className={`status ${status.type}`} role="status">
          {status.text}
        </div>
      )}
    </div>
  );
}

export default ContactForm;
