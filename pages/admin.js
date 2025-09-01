// pages/admin.js
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [contacts, setContacts] = useState([]);

  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASS; // set this in Vercel env

  const handleLogin = () => {
    if (password === correctPassword) {
      setUnlocked(true);
      fetchContacts();
    } else {
      alert("Wrong password!");
    }
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase.from("contacts").select("*");
    if (error) {
      console.error(error);
    } else {
      setContacts(data);
    }
  };

  const downloadVCF = () => {
    let vcfContent = "BEGIN:VCARD\nVERSION:3.0\n";
    contacts.forEach((c) => {
      vcfContent += `FN:${c.name}\nTEL:${c.phone}\nEND:VCARD\nBEGIN:VCARD\nVERSION:3.0\n`;
    });

    const blob = new Blob([vcfContent], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.vcf";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!unlocked) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Admin Login</h2>
        <input
          type="password"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Admin Panel</h1>
      <button onClick={downloadVCF}>Download VCF</button>
      <ul>
        {contacts.map((c) => (
          <li key={c.id}>
            {c.name} - {c.phone}
          </li>
        ))}
      </ul>
    </div>
  );
        }
    
