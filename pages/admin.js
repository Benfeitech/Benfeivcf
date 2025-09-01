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
  if (contacts.length === 0) {
    alert("No contacts to download");
    return;
  }

  // Generate proper VCF content
  let vcfContent = contacts
    .map(
      (c) => `BEGIN:VCARD
VERSION:3.0
FN:${c.name}
TEL:${c.phone}
END:VCARD`
    )
    .join("\n");

  // Create blob
  const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  // Create link and force download
  const a = document.createElement("a");
  a.href = url;
  a.download = "contacts.vcf";
  document.body.appendChild(a); // ✅ required for Chrome mobile
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};
