// pages/admin.js
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [status, setStatus] = useState(""); // for status messages

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
    if (contacts.length === 0) {
      alert("No contacts to download!");
      return;
    }

    let vcfContent = "";
    contacts.forEach((c) => {
      vcfContent += "BEGIN:VCARD\nVERSION:3.0\n";
      vcfContent += `FN:${c.name}\nTEL:${c.phone}\n`;
      vcfContent += "END:VCARD\n";
    });

    const blob = new Blob([vcfContent], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.vcf";
    a.click();
    URL.revokeObjectURL(url);

    setStatus("Contacts downloaded successfully!");
  };

  // New: Clear all contacts
  const clearContacts = async () => {
    if (!confirm("Are you sure you want to delete ALL contacts? This cannot be undone.")) return;

    setStatus("Clearing contacts...");
    // Note: This requires Service Role key on server, not client-side.
    const { data, error } = await supabase.from("contacts").delete().neq("id", 0);

    if (error) {
      console.error(error);
      setStatus(`Error clearing contacts: ${error.message}`);
    } else {
      setContacts([]); // reset contacts in state
      setStatus("All contacts have been cleared!");
    }
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
      <button onClick={clearContacts} style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}>
        Clear Contacts
      </button>
      <p>{status}</p>
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
            
